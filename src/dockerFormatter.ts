/* --------------------------------------------------------------------------------------------
 * Copyright (c) Remy Suen. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextEdit, Position, Range } from 'vscode-languageserver-types';
import { Copy, Dockerfile, DockerfileParser, Run } from 'dockerfile-ast';
import { FormatterSettings } from './main';
import { Heredoc } from 'dockerfile-ast/lib/heredoc';

export class DockerFormatter {

    private getIndentation(formattingOptions?: FormatterSettings): string {
        let indentation = "\t";
        if (formattingOptions && formattingOptions.insertSpaces) {
            indentation = "";
            for (let i = 0; i < formattingOptions.tabSize; i++) {
                indentation = indentation + " ";
            }
        }
        return indentation;
    }

    /**
     * Creates a TextEdit for formatting the given document.
     * 
     * @param document the document being formatted
     * @param start the start offset of the document's content to be replaced
     * @param end the end offset of the document's content to be replaced
     * @param indent true if this block should be replaced with an indentation, false otherwise
     * @param indentation the string to use for an indentation
     */
    private createFormattingEdit(document: TextDocument, start: number, end: number, indent: boolean, indentation: string): TextEdit {
        if (indent) {
            return TextEdit.replace({
                start: document.positionAt(start),
                end: document.positionAt(end)
            }, indentation);
        } else {
            return TextEdit.del({
                start: document.positionAt(start),
                end: document.positionAt(end)
            });
        }
    }

    public formatOnType(document: TextDocument, position: Position, ch: string, options: FormatterSettings): TextEdit[] {
        const dockerfile = DockerfileParser.parse(document.getText());
        // check that the inserted character is the escape character
        if (dockerfile.getEscapeCharacter() === ch) {
            for (let comment of dockerfile.getComments()) {
                // ignore if we're in a comment
                if (comment.getRange().start.line === position.line) {
                    return [];
                }
            }

            const directive = dockerfile.getDirective();
            // ignore if we're in the parser directive
            if (directive && position.line === 0) {
                return [];
            }

            const content = document.getText();
            validityCheck: for (let i = document.offsetAt(position); i < content.length; i++) {
                switch (content.charAt(i)) {
                    case ' ':
                    case '\t':
                        break;
                    case '\r':
                    case '\n':
                        break validityCheck;
                    default:
                        // not escaping a newline, no need to format the next line
                        return [];
                }
            }

            const line = position.line + 1;
            const indentedLines: boolean[] = [];
            const skippedLines: boolean[] = [];
            indentedLines[line] = true;
            skippedLines[line] = true;
            const heredocLines = [];
            if (this.inHeredoc(dockerfile, line)) {
                heredocLines.push(line);
            }
            return this.formatLines(document, document.getText(), [line], indentedLines, skippedLines, heredocLines, options);
        }
        return [];
    }

    public formatRange(document: TextDocument, range: Range, options: FormatterSettings): TextEdit[] {
        const lines: number[] = [];
        for (let i = range.start.line; i <= range.end.line; i++) {
            lines.push(i);
        }
        return this.format(document, lines, options);
    }

    public formatDocument(document: TextDocument, options?: FormatterSettings): TextEdit[] {
        const lines: number[] = [];
        for (let i = 0; i < document.lineCount; i++) {
            lines.push(i);
        }
        return this.format(document, lines, options);
    }

    private inHeredoc(dockerfile: Dockerfile, line: number): boolean {
        for (const instruction of dockerfile.getInstructions()) {
            if (instruction instanceof Copy || instruction instanceof Run) {
                const lines = this.getHeredocLines(instruction.getHeredocs());
                if (lines.indexOf(line) !== -1) {
                    return true;
                }
            }
        }
        return false;
    }

    private getHeredocLines(heredocs: Heredoc[]): number[] {
        let start = -1;
        for (let i = 0; i < heredocs.length; i++) {
            // if there's content, use the first line of the content
            const contentRange = heredocs[i].getContentRange();
            if (contentRange !== null) {
                start = contentRange.start.line;
                break;
            }
            // there may be a delimiter even if there's no content
            const delimiterRange = heredocs[i].getDelimiterRange();
            if (delimiterRange !== null) {
                start = delimiterRange.start.line;
                break;
            }
        }
        if (start === -1) {
            return [];
        }

        let end = -1;
        for (let i = heredocs.length - 1; i >= 0; i--) {
            // there may be a delimiter even if there's no content
            const delimiterRange = heredocs[i].getDelimiterRange();
            if (delimiterRange !== null) {
                end = delimiterRange.end.line;
                break;
            }
            // if there's content, use the first line of the content
            const contentRange = heredocs[i].getContentRange();
            if (contentRange !== null) {
                end = contentRange.end.line;
                break;
            }
        }
        let heredocLines = [];
        for (let i = start; i <= end; i++) {
            heredocLines.push(i);
        }
        return heredocLines;
    }

    /**
     * Formats the specified lines of the given document based on the
     * provided formatting options.
     * 
     * @param document the text document to format
     * @param lines the lines to format
     * @param options the formatting options to use to perform the format
     * @return the text edits to apply to format the lines of the document
     */
    private format(document: TextDocument, lines: number[], options?: FormatterSettings): TextEdit[] {
        let content = document.getText();
        let dockerfile = DockerfileParser.parse(content);
        const indentedLines: boolean[] = [];
        const skippedLines: boolean[] = [];
        const heredocLines: number[] = [];
        for (let i = 0; i < document.lineCount; i++) {
            indentedLines[i] = false;
            skippedLines[i] = false;
        }
        for (let instruction of dockerfile.getInstructions()) {
            let range = instruction.getRange();
            if (range.start.line !== range.end.line) {
                for (let i = range.start.line + 1; i <= range.end.line; i++) {
                    skippedLines[i] = true;
                }
            }
            if (instruction instanceof Copy || instruction instanceof Run) {
                const heredocs = instruction.getHeredocs();
                if (heredocs.length > 0) {
                    heredocLines.push(...this.getHeredocLines(heredocs));
                }
            }
            indentedLines[range.start.line] = false;
            for (let i = range.start.line + 1; i <= range.end.line; i++) {
                indentedLines[i] = true;
            }
        }
        return this.formatLines(document, content, lines, indentedLines, skippedLines, heredocLines, options);
    }

    private formatLines(document: TextDocument, content: string, lines: number[], indentedLines: boolean[], skippedLines: boolean[], heredocLines: number[], options?: FormatterSettings): TextEdit[] {
        const indentation = this.getIndentation(options);
        const edits: TextEdit[] = [];
        lineCheck: for (let i = 0; i < lines.length; i++) {
            if (options && options.ignoreMultilineInstructions && skippedLines[lines[i]]) {
                continue;
            } else if (heredocLines.indexOf(lines[i]) !== -1) {
                continue;
            }

            let startOffset = document.offsetAt(Position.create(lines[i], 0));
            for (let j = startOffset; j < content.length; j++) {
                switch (content.charAt(j)) {
                    case ' ':
                    case '\t':
                        break;
                    case '\r':
                    case '\n':
                        if (j !== startOffset) {
                            // only whitespace on this line, trim it
                            let edit = TextEdit.del({
                                start: document.positionAt(startOffset),
                                end: document.positionAt(j)
                            });
                            edits.push(edit);
                        }
                        // process the next line
                        continue lineCheck;
                    default:
                        // found a line that should be indented
                        if (indentedLines[lines[i]]) {
                            const originalIndentation = document.getText().substring(startOffset, j);
                            // change the indentation if it's not what we expect
                            if (originalIndentation !== indentation) {
                                const edit = this.createFormattingEdit(document, startOffset, j, indentedLines[lines[i]], indentation);
                                edits.push(edit);
                            }
                        } else if (j !== startOffset) {
                            // non-whitespace character encountered, realign
                            const edit = this.createFormattingEdit(document, startOffset, j, indentedLines[lines[i]], indentation);
                            edits.push(edit);
                        }
                        // process the next line
                        continue lineCheck;
                }
            }
            if (startOffset < content.length) {
                // only whitespace on the last line, trim it
                let edit = TextEdit.del({
                    start: document.positionAt(startOffset),
                    end: document.positionAt(content.length)
                });
                edits.push(edit);
            }
        }
        return edits;
    }

}
