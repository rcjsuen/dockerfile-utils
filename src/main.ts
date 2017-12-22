/* --------------------------------------------------------------------------------------------
 * Copyright (c) Remy Suen. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import { TextDocument, Diagnostic, TextEdit, FormattingOptions } from 'vscode-languageserver-types';
import { DockerFormatter } from './dockerFormatter';
import { Validator } from './dockerValidator';

/**
 * The severity options that may be defined for the validator.
 */
export enum ValidationSeverity {

    /**
     * The value to set to ignore a problem that has been detected of
     * a certain type.
     */
    IGNORE,

    /**
     * The value to set to classify a problem that has been detected
     * of a certain type as a warning.
     */
    WARNING,

    /**
     * The value to set to classify a problem that has been detected
     * of a certain type as an error.
     */
    ERROR
}

/**
 * Settings for configuring if the validator should consider a
 * problem an error, a warning, or if the problem should be ignored
 * and not be reported.
 */
export interface ValidatorSettings {

    /**
     * The setting for flagging any deprecated MAINTAINER
     * instructions that are found in the Dockerfile.
     */
    deprecatedMaintainer?: ValidationSeverity;

    /**
     * The setting for flagging directives that are not all written
     * in lowercase.
     */
    directiveCasing?: ValidationSeverity;

    /**
     * The setting for flagging instructions that span multiple lines
     * and contain empty lines (or lines that only contain whitespace
     * characters).
     */
    emptyContinuationLine?: ValidationSeverity;

    /**
     * The setting for flagging instructions that are not all written
     * in uppercase.
     */
    instructionCasing?: ValidationSeverity;

    instructionCmdMultiple?: ValidationSeverity;

    instructionEntrypointMultiple?: ValidationSeverity;

    instructionHealthcheckMultiple?: ValidationSeverity;
}

/**
 * Analyzes the Dockerfile contained within the given string and
 * provides an array of TextEdits back for formatting the document.
 */
export function format(content: string, options: FormattingOptions): TextEdit[] {
    const document = TextDocument.create("", "", 0, content);
    let formatter = new DockerFormatter();
    return formatter.formatDocument(document, options);
}

/**
 * Validates the Dockerfile that is contained in the given string.
 */
export function validate(content: string, settings?: ValidatorSettings): Diagnostic[] {
    const document = TextDocument.create("", "", 0, content);
    const validator = new Validator(settings);
    return validator.validate(document);
}
