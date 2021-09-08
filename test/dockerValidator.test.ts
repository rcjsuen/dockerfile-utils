/* --------------------------------------------------------------------------------------------
 * Copyright (c) Remy Suen. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as assert from "assert";

import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic, DiagnosticSeverity, DiagnosticTag } from 'vscode-languageserver-types';
import { Validator } from '../src/dockerValidator';
import { ValidationCode, ValidatorSettings, ValidationSeverity, validate } from '../src/main';

let source = "dockerfile-utils";

function createDocument(content: string): any {
    return TextDocument.create("uri://host/Dockerfile.sample", "dockerfile", 1, content);
}

function validateDockerfile(content: string, settings?: ValidatorSettings) {
    if (!settings) {
        settings = {
            deprecatedMaintainer: ValidationSeverity.IGNORE,
            directiveCasing: ValidationSeverity.WARNING,
            instructionCasing: ValidationSeverity.WARNING,
            instructionCmdMultiple: ValidationSeverity.IGNORE,
            instructionEntrypointMultiple: ValidationSeverity.IGNORE,
            instructionHealthcheckMultiple: ValidationSeverity.IGNORE,
            instructionWorkdirRelative: ValidationSeverity.WARNING,
        };
    }
    return validate(content, settings);
}

function convertValidationSeverity(severity: ValidationSeverity): DiagnosticSeverity {
    return severity === ValidationSeverity.ERROR ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning;
}

function assertDiagnostics(diagnostics: Diagnostic[], codes: ValidationCode[], functions: Function[], args: any[][]) {
    assert.equal(diagnostics.length, codes.length);
    diagnosticCheck: for (let diagnostic of diagnostics) {
        for (let i = 0; i < codes.length; i++) {
            if (diagnostic.code === codes[i]) {
                args[i].unshift(diagnostic);
                functions[i].apply(null, args[i]);
                continue diagnosticCheck;
            }
        }
        throw new Error("Diagnostic with code " + diagnostic.code + " not expected");
    }
}

function assertNoSourceImage(diagnostic: Diagnostic, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.NO_SOURCE_IMAGE);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_NoSourceImage());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertEmptyContinuationLine(diagnostic: Diagnostic, severity: DiagnosticSeverity, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.EMPTY_CONTINUATION_LINE);
    assert.equal(diagnostic.severity, severity);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_EmptyContinuationLine());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertFlagAtLeastOne(diagnostic: Diagnostic, flagName: string, flagValue: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.FLAG_AT_LEAST_ONE);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_FlagAtLeastOne(flagName, flagValue));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertFlagDuplicate(diagnostic: Diagnostic, flag: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.FLAG_DUPLICATE);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_FlagDuplicate(flag));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertFlagInvalidDuration(diagnostic: Diagnostic, flag: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.FLAG_INVALID_DURATION);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_FlagInvalidDuration(flag));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertFlagLessThan1ms(diagnostic: Diagnostic, flag: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.FLAG_LESS_THAN_1MS);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_FlagLessThan1ms(flag));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertFlagMissingDuration(diagnostic: Diagnostic, duration: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.FLAG_MISSING_DURATION);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_FlagMissingDuration(duration));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertFlagInvalidFrom(diagnostic: Diagnostic, flag: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.FLAG_INVALID_FROM_VALUE);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_FlagInvalidFromValue(flag));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertFlagMissingValue(diagnostic: Diagnostic, flag: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.FLAG_MISSING_VALUE);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_FlagMissingValue(flag));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertUnknownFlag(diagnostic: Diagnostic, flag: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_FlagUnknown(flag));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertUnknownAddFlag(diagnostic: Diagnostic, flag: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.UNKNOWN_ADD_FLAG);
    assertUnknownFlag(diagnostic, flag, startLine, startCharacter, endLine, endCharacter);
}

function assertUnknownCopyFlag(diagnostic: Diagnostic, flag: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.UNKNOWN_COPY_FLAG);
    assertUnknownFlag(diagnostic, flag, startLine, startCharacter, endLine, endCharacter);
}

function assertFlagUnknownUnit(diagnostic: Diagnostic, unit: string, duration: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.FLAG_UNKNOWN_UNIT);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_FlagUnknownUnit(unit, duration));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertUnknownFromFlag(diagnostic: Diagnostic, flag: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.UNKNOWN_FROM_FLAG);
    assertUnknownFlag(diagnostic, flag, startLine, startCharacter, endLine, endCharacter);
}

function assertUnknownHealthcheckFlag(diagnostic: Diagnostic, flag: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.UNKNOWN_HEALTHCHECK_FLAG);
    assertUnknownFlag(diagnostic, flag, startLine, startCharacter, endLine, endCharacter);
}

function assertBaseNameEmpty(diagnostic: Diagnostic, name: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.BASE_NAME_EMPTY);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_BaseNameEmpty(name));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertInvalidAs(diagnostic: Diagnostic, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.INVALID_AS);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_InvalidAs());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertInvalidPort(diagnostic: Diagnostic, port: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.INVALID_PORT);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_InvalidPort(port));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertInvalidProto(diagnostic: Diagnostic, protocol: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.INVALID_PROTO);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_InvalidProto(protocol));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertInvalidReferenceFormat(diagnostic: Diagnostic, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.INVALID_REFERENCE_FORMAT);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_InvalidReferenceFormat());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertInvalidStopSignal(diagnostic: Diagnostic, signal: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.INVALID_SIGNAL);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_InvalidSignal(signal));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertInvalidSyntax(diagnostic: Diagnostic, syntax: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.INVALID_SYNTAX);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_InvalidSyntax(syntax));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertDirectiveCasing(diagnostic: Diagnostic, severity: DiagnosticSeverity, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.CASING_DIRECTIVE);
    assert.equal(diagnostic.severity, severity);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_DirectiveCasing());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertInstructionCasing(diagnostic: Diagnostic, severity: DiagnosticSeverity, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.CASING_INSTRUCTION);
    assert.equal(diagnostic.severity, severity);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_InstructionCasing());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertInstructionExtraArgument(diagnostic: Diagnostic, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.ARGUMENT_EXTRA);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_InstructionExtraArgument());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertInstructionMissingArgument(diagnostic: Diagnostic, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.ARGUMENT_MISSING);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_InstructionMissingArgument());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertInstructionMultiple(diagnostic: Diagnostic, severity: DiagnosticSeverity, instruction: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.MULTIPLE_INSTRUCTIONS);
    assert.equal(diagnostic.severity, severity);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags.length, 1);
    assert.strictEqual(diagnostic.tags[0], DiagnosticTag.Unnecessary);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_InstructionMultiple(instruction));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertHealthcheckCmdArgumentMissing(diagnostic: Diagnostic, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.HEALTHCHECK_CMD_ARGUMENT_MISSING);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_HealthcheckCmdArgumentMissing());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertHealthcheckTypeUnknown(diagnostic: Diagnostic, type: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.UNKNOWN_TYPE);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_HealthcheckTypeUnknown(type));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertADDDestinationNotDirectory(diagnostic: Diagnostic, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.INVALID_DESTINATION);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_ADDDestinationNotDirectory());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertADDRequiresAtLeastTwoArguments(diagnostic: Diagnostic, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.ARGUMENT_REQUIRES_AT_LEAST_TWO);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_ADDRequiresAtLeastTwoArguments());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertCOPYDestinationNotDirectory(diagnostic: Diagnostic, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.INVALID_DESTINATION);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_COPYDestinationNotDirectory());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertCOPYRequiresAtLeastTwoArguments(diagnostic: Diagnostic, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.ARGUMENT_REQUIRES_AT_LEAST_TWO);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_COPYRequiresAtLeastTwoArguments());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertENVRequiresTwoArguments(diagnostic: Diagnostic, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.ARGUMENT_REQUIRES_TWO);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_ENVRequiresTwoArguments());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertHEALTHCHECKRequiresAtLeastOneArgument(diagnostic: Diagnostic, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.ARGUMENT_REQUIRES_AT_LEAST_ONE);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_HEALTHCHECKRequiresAtLeastOneArgument());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertInstructionRequiresOneOrThreeArguments(diagnostic: Diagnostic, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.ARGUMENT_REQUIRES_ONE_OR_THREE);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_InstructionRequiresOneOrThreeArguments());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertInstructionUnnecessaryArgument(diagnostic: Diagnostic, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.ARGUMENT_UNNECESSARY);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_HealthcheckNoneUnnecessaryArgument());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertInstructionUnknown(diagnostic: Diagnostic, instruction: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.UNKNOWN_INSTRUCTION);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_InstructionUnknown(instruction));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertInstructionJSONInSingleQuotes(diagnostic: Diagnostic, severity: DiagnosticSeverity, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.JSON_IN_SINGLE_QUOTES);
    assert.equal(diagnostic.severity, severity);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_InstructionJSONInSingleQuotes());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertOnbuildChainingDisallowed(diagnostic: Diagnostic, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.ONBUILD_CHAINING_DISALLOWED);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_OnbuildChainingDisallowed());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertShellJsonForm(diagnostic: Diagnostic, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.SHELL_JSON_FORM);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_ShellJsonForm());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertShellRequiresOne(diagnostic: Diagnostic, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.SHELL_REQUIRES_ONE);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_ShellRequiresOne());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertOnbuildTriggerDisallowed(diagnostic: Diagnostic, trigger: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.ONBUILD_TRIGGER_DISALLOWED);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_OnbuildTriggerDisallowed(trigger));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertDirectiveEscapeDuplicated(diagnostic: Diagnostic, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.DUPLICATED_ESCAPE_DIRECTIVE);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags.length, 1);
    assert.strictEqual(diagnostic.tags[0], DiagnosticTag.Unnecessary);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_DirectiveEscapeDuplicated());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertDirectiveEscapeInvalid(diagnostic: Diagnostic, value: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.INVALID_ESCAPE_DIRECTIVE);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_DirectiveEscapeInvalid(value));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertDeprecatedMaintainer(diagnostic: Diagnostic, severity: DiagnosticSeverity, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.DEPRECATED_MAINTAINER);
    assert.equal(diagnostic.severity, severity);
    assert.equal(diagnostic.source, source);
    assert.equal(diagnostic.tags.length, 1);
    assert.equal(diagnostic.tags[0], DiagnosticTag.Deprecated);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_DeprecatedMaintainer());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertSyntaxMissingEquals(diagnostic: Diagnostic, argument: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.SYNTAX_MISSING_EQUALS);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_SyntaxMissingEquals(argument));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertSyntaxMissingNames(diagnostic: Diagnostic, instrument: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.SYNTAX_MISSING_NAMES);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_SyntaxMissingNames(instrument));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertSyntaxMissingSingleQuote(diagnostic: Diagnostic, key: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.SYNTAX_MISSING_SINGLE_QUOTE);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_SyntaxMissingSingleQuote(key));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertSyntaxMissingDoubleQuote(diagnostic: Diagnostic, key: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.SYNTAX_MISSING_DOUBLE_QUOTE);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_SyntaxMissingDoubleQuote(key));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertDuplicateBuildStageName(diagnostic: Diagnostic, name: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.DUPLICATE_BUILD_STAGE_NAME);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_DuplicateBuildStageName(name));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertInvalidBuildStageName(diagnostic: Diagnostic, name: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.INVALID_BUILD_STAGE_NAME);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_InvalidBuildStageName(name));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertVariableModifierUnsupported(diagnostic: Diagnostic, variable: string, modifier: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.UNSUPPORTED_MODIFIER);
    assert.equal(diagnostic.severity, DiagnosticSeverity.Error);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_VariableModifierUnsupported(variable, modifier));
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function assertWorkdirAbsolutePath(diagnostic: Diagnostic, severity: DiagnosticSeverity, startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    assert.equal(diagnostic.code, ValidationCode.WORKDIR_IS_NOT_ABSOLUTE);
    assert.equal(diagnostic.severity, severity);
    assert.equal(diagnostic.source, source);
    assert.strictEqual(diagnostic.tags, undefined);
    assert.equal(diagnostic.message, Validator.getDiagnosticMessage_WORKDIRPathNotAbsolute());
    assert.equal(diagnostic.range.start.line, startLine);
    assert.equal(diagnostic.range.start.character, startCharacter);
    assert.equal(diagnostic.range.end.line, endLine);
    assert.equal(diagnostic.range.end.character, endCharacter);
}

function testValidArgument(instruction: string, argument: string) {
    let gaps = [ " ", "\t", " \\\n", " \\\r\n" ];
    for (let gap of gaps) {
        let diagnostics = validateDockerfile("FROM node\n" + instruction + gap + argument);
        assert.equal(diagnostics.length, 0);

        diagnostics = validateDockerfile("FROM node\n" + instruction + gap + argument + " ");
        assert.equal(diagnostics.length, 0);

        diagnostics = validateDockerfile("FROM node\n" + instruction + gap + argument + "\n");
        assert.equal(diagnostics.length, 0);

        diagnostics = validateDockerfile("FROM node\n" + instruction + gap + argument + "\r\n");
        assert.equal(diagnostics.length, 0);

        diagnostics = validateDockerfile("FROM node\n" + instruction + gap + argument + " \n");
        assert.equal(diagnostics.length, 0);

        diagnostics = validateDockerfile("FROM node\n" + instruction + gap + argument + " \r\n");
        assert.equal(diagnostics.length, 0);

        diagnostics = validateDockerfile("FROM node\n" + instruction + gap + argument + "\n ");
        assert.equal(diagnostics.length, 0);

        diagnostics = validateDockerfile("FROM node\n" + instruction + gap + argument + "\r\n ");
        assert.equal(diagnostics.length, 0);
    }
}

function testEscape(instruction: string, argumentFront: string, argumentBack: string) {
    var argument = argumentFront + argumentBack;
    let diagnostics = validateDockerfile("FROM node\n" + instruction + " \\\n" + argument);
    assert.equal(diagnostics.length, 0);
    
    diagnostics = validateDockerfile("FROM node\n" + instruction + " \\\n " + argument);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + "\\\n " + argument);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + " \\ \n" + argument);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + "\\ \n " + argument);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + " \\ \n " + argument);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + " \\  \n " + argument);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + " \\\t\n " + argument);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + " \\\t\t\n " + argument);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + " \\  \r " + argument);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + " \\\t\r " + argument);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + " \\\t\t\r " + argument);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + " \\\r\n" + argument);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + "\\\r\n " + argument);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + " \\\r\n " + argument);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + " \\ \r\n" + argument);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + "\\ \r\n " + argument);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + " \\ \r\n " + argument);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + " " + argument + "\\\n");
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + " " + argumentFront + "\\\n" + argumentBack);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + " " + argumentFront + "\\\r\n" + argumentBack);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + " " + argumentFront + "\\\r\n" + argumentBack);
    assert.equal(diagnostics.length, 0);

    diagnostics = validateDockerfile("FROM node\n" + instruction + " " + argumentFront + "\\\r\n" + argumentBack + "\n");
    assert.equal(diagnostics.length, 0);
}

describe("Docker Validator Tests", function() {
    describe("no content", function() {
        it("empty file", function() {
            let diagnostics = validateDockerfile("");
            assert.equal(diagnostics.length, 1);
            assertNoSourceImage(diagnostics[0], 0, 0, 0, 0);
        });

        it("whitespace only", function() {
            let diagnostics = validateDockerfile(" \t\r\n");
            assert.equal(diagnostics.length, 1);
            assertNoSourceImage(diagnostics[0], 0, 0, 0, 0);
        });

        it("comments only", function() {
            let diagnostics = validateDockerfile("# This is a comment");
            assert.equal(diagnostics.length, 1);
            assertNoSourceImage(diagnostics[0], 0, 0, 0, 0);

            diagnostics = validateDockerfile("#=This is a comment");
            assert.equal(diagnostics.length, 1);
            assertNoSourceImage(diagnostics[0], 0, 0, 0, 0);
        });

        it("directive only", function() {
            let diagnostics = validateDockerfile("# escape=`");
            assert.equal(diagnostics.length, 1);
            assertNoSourceImage(diagnostics[0], 0, 0, 0, 0);

            diagnostics = validateDockerfile("# escape=\\");
            assert.equal(diagnostics.length, 1);
            assertNoSourceImage(diagnostics[0], 0, 0, 0, 0);
        });

        it("FROM in comment", function() {
            let diagnostics = validateDockerfile("# FROM node");
            assert.equal(diagnostics.length, 1);
            assertNoSourceImage(diagnostics[0], 0, 0, 0, 0);
        });
    });

    function createUppercaseStyleTest(trigger: boolean) {
        let onbuild = trigger ? "ONBUILD " : "";
        let triggerLength = onbuild.length;
        describe("uppercase style check", function() {
            function testCasingStyle(mixed: string, argument: string) {
                var length = mixed.length;
                let diagnostics = validateDockerfile("FROM node\n" + onbuild + mixed.toUpperCase() + " " + argument);
                if (trigger) {
                    switch (mixed.toUpperCase()) {
                        case "FROM":
                        case "MAINTAINER":
                            assert.equal(diagnostics.length, 1);
                            assertOnbuildTriggerDisallowed(diagnostics[0], mixed.toUpperCase(), 1, triggerLength, 1, triggerLength + length);
                            break;
                        case "ONBUILD":
                            assert.equal(diagnostics.length, 1);
                            assertOnbuildChainingDisallowed(diagnostics[0], 1, triggerLength, 1, triggerLength + length);
                            break;
                        default:
                            assert.equal(diagnostics.length, 0);
                            break;
                    }
                } else {
                    assert.equal(diagnostics.length, 0);
                }

                diagnostics = validateDockerfile("FROM node\n" + onbuild + mixed.toLowerCase() + " " + argument);
                if (trigger) {
                    switch (mixed.toUpperCase()) {
                        case "FROM":
                        case "MAINTAINER":
                            assert.equal(diagnostics.length, 2);
                            assertDiagnostics(diagnostics,
                                [ ValidationCode.ONBUILD_TRIGGER_DISALLOWED, ValidationCode.CASING_INSTRUCTION ],
                                [ assertOnbuildTriggerDisallowed, assertInstructionCasing ],
                                [ [ mixed.toUpperCase(), 1, triggerLength, 1, triggerLength + length ],
                                    [ DiagnosticSeverity.Warning, 1, triggerLength, 1, triggerLength + length ] ]);
                            break;
                        case "ONBUILD":
                            assert.equal(diagnostics.length, 2);
                            assertDiagnostics(diagnostics,
                                [ ValidationCode.ONBUILD_CHAINING_DISALLOWED, ValidationCode.CASING_INSTRUCTION ],
                                [ assertOnbuildChainingDisallowed, assertInstructionCasing ],
                                [ [ 1, triggerLength, 1, triggerLength + length ],
                                    [ DiagnosticSeverity.Warning, 1, triggerLength, 1, triggerLength + length ] ]);
                            break;
                        default:
                            assert.equal(diagnostics.length, 1);
                            assertInstructionCasing(diagnostics[0], DiagnosticSeverity.Warning, 1, triggerLength, 1, triggerLength + length);
                            break;
                    }
                } else {
                    assert.equal(diagnostics.length, 1);
                    assertInstructionCasing(diagnostics[0], DiagnosticSeverity.Warning, 1, triggerLength, 1, triggerLength + length);
                }

                diagnostics = validateDockerfile("FROM node\n" + onbuild + mixed + " " + argument);
                if (trigger) {
                    switch (mixed.toUpperCase()) {
                        case "FROM":
                        case "MAINTAINER":
                            assert.equal(diagnostics.length, 2);
                            assertDiagnostics(diagnostics,
                                [ ValidationCode.ONBUILD_TRIGGER_DISALLOWED, ValidationCode.CASING_INSTRUCTION ],
                                [ assertOnbuildTriggerDisallowed, assertInstructionCasing ],
                                [ [ mixed.toUpperCase(), 1, triggerLength, 1, triggerLength + length ],
                                    [ DiagnosticSeverity.Warning, 1, triggerLength, 1, triggerLength + length ] ]);
                            break;
                        case "ONBUILD":
                            assert.equal(diagnostics.length, 2);
                            assertDiagnostics(diagnostics,
                                [ ValidationCode.ONBUILD_CHAINING_DISALLOWED, ValidationCode.CASING_INSTRUCTION ],
                                [ assertOnbuildChainingDisallowed, assertInstructionCasing ],
                                [ [ 1, triggerLength, 1, triggerLength + length ],
                                    [ DiagnosticSeverity.Warning, 1, triggerLength, 1, triggerLength + length ] ]);
                            break;
                        default:
                            assert.equal(diagnostics.length, 1);
                            assertInstructionCasing(diagnostics[0], DiagnosticSeverity.Warning, 1, triggerLength, 1, triggerLength + length);
                            break;
                    }
                } else {
                    assert.equal(diagnostics.length, 1);
                    assertInstructionCasing(diagnostics[0], DiagnosticSeverity.Warning, 1, triggerLength, 1, triggerLength + length);
                }

                diagnostics = validateDockerfile("FROM node\n#" + onbuild + mixed.toLowerCase() + " " + argument);
                assert.equal(diagnostics.length, 0);
            }

            it("ADD", function() {
                testCasingStyle("aDd", "source dest");
            });

            it("ARG", function() {
                testCasingStyle("aRg", "name");
            });

            it("CMD", function() {
                testCasingStyle("cMd", "[ \"/bin/ls\" ]");
            });

            it("COPY", function() {
                testCasingStyle("copY", "source dest");
            });

            it("ENTRYPOINT", function() {
                testCasingStyle("entryPOINT", "[ \"/usr/bin/sh\" ]");
            });

            it("ENV", function() {
                testCasingStyle("EnV", "key=value");
            });

            it("EXPOSE", function() {
                testCasingStyle("expOSe", "8080");
            });

            it("FROM", function() {
                testCasingStyle("fROm", "node");
            });

            it("HEALTHCHECK", function() {
                testCasingStyle("healTHCHeck", "NONE");
            });

            it("LABEL", function() {
                testCasingStyle("LAbel", "key=value");
            });

            it("MAINTAINER", function() {
                testCasingStyle("maINTaiNER", "authorName");
            });

            it("ONBUILD", function() {
                testCasingStyle("onBUILD", "HEALTHCHECK NONE");
            });

            it("RUN", function() {
                testCasingStyle("rUN", "apt-get update");
            });

            it("SHELL", function() {
                testCasingStyle("shELL", "[ \"powershell\" ]");
            });

            it("STOPSIGNAL", function() {
                testCasingStyle("stopSIGNal", "9");
            });

            it("USER", function() {
                testCasingStyle("uSEr", "daemon");
            });

            it("VOLUME", function() {
                testCasingStyle("VOLume", "[ \"/data\" ]");
            });

            it("WORKDIR", function() {
                testCasingStyle("workDIR", "/path");
            });

            it("default", function() {
                let validator = new Validator();
                let diagnostics = validator.validate(createDocument("from busybox"));
                assert.equal(diagnostics.length, 1);
                assertInstructionCasing(diagnostics[0], DiagnosticSeverity.Warning, 0, 0, 0, 4);
            });

            it("ignore", function() {
                let diagnostics = validateDockerfile("fROm busybox", { instructionCasing: ValidationSeverity.IGNORE });
                assert.equal(diagnostics.length, 0);
            });

            it("warning", function() {
                let diagnostics = validateDockerfile("fROm busybox", { instructionCasing: ValidationSeverity.WARNING });
                assert.equal(diagnostics.length, 1);
                assertInstructionCasing(diagnostics[0], DiagnosticSeverity.Warning, 0, 0, 0, 4);
            });

            it("error", function() {
                let diagnostics = validateDockerfile("fROm busybox", { instructionCasing: ValidationSeverity.ERROR });
                assert.equal(diagnostics.length, 1);
                assertInstructionCasing(diagnostics[0], DiagnosticSeverity.Error, 0, 0, 0, 4);
            });
        });
    }

    describe("instruction", function() {
        createUppercaseStyleTest(false);

        describe("extra argument", function() {
            function testExtraArgument(prefix: string, assertDiagnostic: Function) {
                let length = prefix.length;
                let diagnostics = validateDockerfile("FROM node\n" + prefix + " extra");
                assert.equal(diagnostics.length, 1);
                assertDiagnostic(diagnostics[0], 1, length + 1, 1, length + 6);

                diagnostics = validateDockerfile("FROM node\n" + prefix + " extra\r");
                assert.equal(diagnostics.length, 1);
                assertDiagnostic(diagnostics[0], 1, length + 1, 1, length + 6);

                diagnostics = validateDockerfile("FROM node\n" + prefix + " extra ");
                assert.equal(diagnostics.length, 1);
                assertDiagnostic(diagnostics[0], 1, length + 1, 1, length + 6);

                diagnostics = validateDockerfile("FROM node\n" + prefix + " extra\t");
                assert.equal(diagnostics.length, 1);
                assertDiagnostic(diagnostics[0], 1, length + 1, 1, length + 6);

                diagnostics = validateDockerfile("FROM node\n" + prefix + " extra\n");
                assert.equal(diagnostics.length, 1);
                assertDiagnostic(diagnostics[0], 1, length + 1, 1, length + 6);

                diagnostics = validateDockerfile("FROM node\n" + prefix + " \\\nextra");
                assert.equal(diagnostics.length, 1);
                assertDiagnostic(diagnostics[0], 2, 0, 2, 5);

                diagnostics = validateDockerfile("FROM node\n" + prefix + " \\\r\nextra");
                assert.equal(diagnostics.length, 1);
                assertDiagnostic(diagnostics[0], 2, 0, 2, 5);

                diagnostics = validateDockerfile("FROM node\n" + prefix + " \\\r\nextra");
                assert.equal(diagnostics.length, 1);
                assertDiagnostic(diagnostics[0], 2, 0, 2, 5);
            }

            it("FROM", function() {
                testExtraArgument("FROM node", assertInstructionRequiresOneOrThreeArguments);
            });

            it("STOPSIGNAL", function() {
                testExtraArgument("STOPSIGNAL SIGTERM", assertInstructionExtraArgument);
            });
        });

        describe("missing argument", function() {
            function testMissingArgument(instruction: string, prefix: string, middle: string, suffix: string, safe?: boolean, assertFunction?: Function) {
                var length = instruction.length;
                let diagnostics = validateDockerfile("FROM node\n" + instruction + prefix + middle + suffix);
                if (safe) {
                    assert.equal(diagnostics.length, 0);
                } else if (assertFunction) {
                    assert.equal(diagnostics.length, 1);
                    assertFunction(diagnostics[0], 1, 0, 1, length);
                } else {
                    assert.equal(diagnostics.length, 1);
                    assertInstructionMissingArgument(diagnostics[0], 1, 0, 1, length);
                }
            }

            function testMissingArgumentLoop(instruction: string, safe?: boolean, assertFunction?: Function) {
                let newlines = [ "", "\r", "\n", "\r\n", "\\\r", "\\\n", "\\\r\n" ];
                for (let newline of newlines) {
                    testMissingArgument(instruction, "", newline, "", safe, assertFunction);
                    testMissingArgument(instruction, "", newline, " ", safe, assertFunction);
                    testMissingArgument(instruction, " ", newline, "", safe, assertFunction);
                    testMissingArgument(instruction, " ", newline, " ", safe, assertFunction);
                    testMissingArgument(instruction, "", newline, "\t", safe, assertFunction);
                    testMissingArgument(instruction, "\t", newline, "", safe, assertFunction);
                    testMissingArgument(instruction, "\t", newline, "\t", safe, assertFunction);
                }
                testMissingArgument(instruction, " ", "\\", "", safe, assertFunction);
            }

            it("ADD", function() {
                return testMissingArgumentLoop("ADD", false, assertADDRequiresAtLeastTwoArguments);
            });

            it("ARG", function() {
                testMissingArgumentLoop("ARG");
                testMissingArgument("ARG", " \\\n# comment", "", "");
            });

            it("CMD", function() {
                return testMissingArgumentLoop("CMD", true);
            });

            it("COPY", function() {
                return testMissingArgumentLoop("COPY", false, assertCOPYRequiresAtLeastTwoArguments);
            });

            it("ENTRYPOINT", function() {
                return testMissingArgumentLoop("ENTRYPOINT");
            });

            it("ENV", function() {
                testMissingArgumentLoop("ENV");
                testMissingArgument("ENV", " \\\n# comment", "", "");
            });

            it("EXPOSE", function() {
                return testMissingArgumentLoop("EXPOSE");
            });

            it("FROM", function() {
                return testMissingArgumentLoop("FROM");
            });

            it("HEALTHCHECK", function() {
                return testMissingArgumentLoop("HEALTHCHECK", false, assertHEALTHCHECKRequiresAtLeastOneArgument);
            });

            it("LABEL", function() {
                return testMissingArgumentLoop("LABEL");
            });

            it("MAINTAINER", function() {
                return testMissingArgumentLoop("MAINTAINER");
            });

            it("ONBUILD", function() {
                return testMissingArgumentLoop("ONBUILD");
            });

            it("RUN", function() {
                return testMissingArgumentLoop("RUN");
            });

            it("SHELL", function() {
                return testMissingArgumentLoop("SHELL");
            });

            it("STOPSIGNAL", function() {
                return testMissingArgumentLoop("STOPSIGNAL");
            });

            it("USER", function() {
                return testMissingArgumentLoop("USER");
            });

            it("VOLUME", function() {
                return testMissingArgumentLoop("VOLUME");
            });

            it("WORKDIR", function() {
                return testMissingArgumentLoop("WORKDIR");
            });
        });

        describe("escaped instruction", function() {
            function testEscapedInstruction(instructionPrefix: string, middle: string, instructionSuffix: string, args: string) {
                let diagnostics = validateDockerfile("FROM node\n" + instructionPrefix + middle + instructionSuffix + " " + args);
                assert.equal(diagnostics.length, 0);
            }

            function testEscapedInstructionLoop(instruction: string, args: string) {
                let newlines = ["\\\n", "\\\r\n", "\\ \n", "\\ \r\n", "\\\t\n", "\\\t\r\n", "\\\n\n", "\\\r\n\r\n"];
                for (let newline of newlines) {
                    testEscapedInstruction(instruction.substring(0, 1), newline, instruction.substring(1), args);
                }
            }

            it("ADD", function() {
                testEscapedInstructionLoop("ADD", "source dest");
            });

            it("ARG", function() {
                testEscapedInstructionLoop("ARG", "name");
            });

            it("CMD", function() {
                testEscapedInstructionLoop("CMD", "[ \"/bin/ls\" ]");
            });

            it("COPY", function() {
                testEscapedInstructionLoop("COPY", "source dest");
            });

            it("ENTRYPOINT", function() {
                testEscapedInstructionLoop("ENTRYPOINT", "[ \"/usr/bin/sh\" ]");
            });

            it("ENV", function() {
                testEscapedInstructionLoop("ENV", "key=value");
            });

            it("EXPOSE", function() {
                testEscapedInstructionLoop("EXPOSE", "8080");
            });

            it("FROM", function() {
                testEscapedInstructionLoop("FROM", "node");
            });

            it("HEALTHCHECK", function() {
                testEscapedInstructionLoop("HEALTHCHECK", "NONE");
            });

            it("LABEL", function() {
                testEscapedInstructionLoop("LABEL", "key=value");
            });

            it("MAINTAINER", function() {
                testEscapedInstructionLoop("MAINTAINER", "authorName");
            });

            it("ONBUILD", function() {
                testEscapedInstructionLoop("ONBUILD", "HEALTHCHECK NONE");
            });

            it("RUN", function() {
                testEscapedInstructionLoop("RUN", "apt-get update");
            });

            it("SHELL", function() {
                testEscapedInstructionLoop("SHELL", "[ \"powershell\" ]");
            });

            it("STOPSIGNAL", function() {
                testEscapedInstructionLoop("STOPSIGNAL", "9");
            });

            it("USER", function() {
                testEscapedInstructionLoop("USER", "daemon");
            });

            it("VOLUME", function() {
                testEscapedInstructionLoop("VOLUME", "[ \"/data\" ]");
            });

            it("WORKDIR", function() {
                testEscapedInstructionLoop("WORKDIR", "/path");
            });
        });

        describe("heredoc", () => {
            function testHeredocDestinationFolder(prefix: string, isAdd: boolean, offset: number, length: number) {
                it(prefix, () => {
                    let content = `FROM node\n${prefix} a.txt <<file b.txt <<file2 /destination/\nabc\nfile\ndef\nfile2\n`;
                    let diagnostics = validateDockerfile(content);
                    assert.strictEqual(diagnostics.length, 0);

                    content = `FROM node\n${prefix} <<eot /app/out.txt\n  hello\neot`;
                    diagnostics = validateDockerfile(content);
                    assert.strictEqual(diagnostics.length, 0);

                    content = `FROM node\n${prefix} <<eot\n  hello\neot`;
                    diagnostics = validateDockerfile(content);
                    assert.strictEqual(diagnostics.length, 1);
                    if (isAdd) {
                        assertADDRequiresAtLeastTwoArguments(diagnostics[0], 1, offset, 1, offset + length);
                    } else {
                        assertCOPYRequiresAtLeastTwoArguments(diagnostics[0], 1, offset, 1, offset + length);
                    }
                });
            }

            testHeredocDestinationFolder("ADD", true, 0, 3);
            testHeredocDestinationFolder("COPY", false, 0, 4);
            testHeredocDestinationFolder("ONBUILD ADD", true, 8, 3);
            testHeredocDestinationFolder("ONBUILD COPY", false, 8, 4);

            function testHeredocRUN(prefix: string) {
                it(`${prefix}RUN`, () => {
                    let content = `FROM node\n${prefix}RUN <<eot\n  echo\neot`;
                    let diagnostics = validateDockerfile(content);
                    assert.equal(diagnostics.length, 0);

                    content = `FROM node\n${prefix}RUN <<-eot\n  echo\neot`;
                    diagnostics = validateDockerfile(content);
                    assert.equal(diagnostics.length, 0);

                    content = `FROM node\n${prefix}RUN <<-'eot'\n  echo\neot`;
                    diagnostics = validateDockerfile(content);
                    assert.equal(diagnostics.length, 0);
                });
            }

            testHeredocRUN("");
            testHeredocRUN("ONBUILD ");
        });

        describe("multiples", function() {
            function createMultiplesTest(instruction: string, args: string, settingsName: string) {
                let line = instruction + " " + args;
                let content = "FROM busybox\n" + line + "\n" + line;
                let contentMultiStage = "FROM busybox\n" + line + "\n" + line + "\nFROM alpine\n" + line + "\n" + line;
                let instructionLength = instruction.length;

                it("ok", function() {
                    let safe = "FROM busybox\n" + line + "\nFROM alpine\n" + line;
                    let diagnostics = validateDockerfile(safe);
                    assert.equal(diagnostics.length, 0);
                });

                it("default", function() {
                    let validator = new Validator();
                    let diagnostics = validator.validate(createDocument(content));
                    assert.equal(diagnostics.length, 2);
                    assertInstructionMultiple(diagnostics[0], DiagnosticSeverity.Warning, instruction, 1, 0, 1, instructionLength);
                    assertInstructionMultiple(diagnostics[1], DiagnosticSeverity.Warning, instruction, 2, 0, 2, instructionLength);

                    diagnostics = validator.validate(createDocument(contentMultiStage));
                    assert.equal(diagnostics.length, 4);
                    assertInstructionMultiple(diagnostics[0], DiagnosticSeverity.Warning, instruction, 1, 0, 1, instructionLength);
                    assertInstructionMultiple(diagnostics[1], DiagnosticSeverity.Warning, instruction, 2, 0, 2, instructionLength);
                    assertInstructionMultiple(diagnostics[2], DiagnosticSeverity.Warning, instruction, 4, 0, 4, instructionLength);
                    assertInstructionMultiple(diagnostics[3], DiagnosticSeverity.Warning, instruction, 5, 0, 5, instructionLength);
                });

                it("ignore", function() {
                    let settings: any = {};
                    settings[settingsName] = ValidationSeverity.IGNORE;
                    let diagnostics = validateDockerfile(content, settings);
                    assert.equal(diagnostics.length, 0);
                });

                it("warning", function() {
                    let settings: any = {};
                    settings[settingsName] = ValidationSeverity.WARNING;
                    let diagnostics = validateDockerfile(content, settings);
                    assert.equal(diagnostics.length, 2);

                    diagnostics = validateDockerfile(contentMultiStage, settings);
                    assert.equal(diagnostics.length, 4);
                    assertInstructionMultiple(diagnostics[0], DiagnosticSeverity.Warning, instruction, 1, 0, 1, instructionLength);
                    assertInstructionMultiple(diagnostics[1], DiagnosticSeverity.Warning, instruction, 2, 0, 2, instructionLength);
                    assertInstructionMultiple(diagnostics[2], DiagnosticSeverity.Warning, instruction, 4, 0, 4, instructionLength);
                    assertInstructionMultiple(diagnostics[3], DiagnosticSeverity.Warning, instruction, 5, 0, 5, instructionLength);
                });

                it("error", function() {
                    let settings: any = {};
                    settings[settingsName] = ValidationSeverity.ERROR;
                    let diagnostics = validateDockerfile(content, settings);
                    assert.equal(diagnostics.length, 2);

                    diagnostics = validateDockerfile(contentMultiStage, settings);
                    assert.equal(diagnostics.length, 4);
                    assertInstructionMultiple(diagnostics[0], DiagnosticSeverity.Error, instruction, 1, 0, 1, instructionLength);
                    assertInstructionMultiple(diagnostics[1], DiagnosticSeverity.Error, instruction, 2, 0, 2, instructionLength);
                    assertInstructionMultiple(diagnostics[2], DiagnosticSeverity.Error, instruction, 4, 0, 4, instructionLength);
                    assertInstructionMultiple(diagnostics[3], DiagnosticSeverity.Error, instruction, 5, 0, 5, instructionLength);
                });
            };

            describe("CMD", function() {
                createMultiplesTest("CMD", "ls", "instructionCmdMultiple");
            });

            describe("ENTRYPOINT", function() {
                createMultiplesTest("ENTRYPOINT", "ls", "instructionEntrypointMultiple");
            });

            describe("HEALTHCHECK", function() {
                describe("CMD", function() {
                    createMultiplesTest("HEALTHCHECK", "CMD ls", "instructionHealthcheckMultiple");
                });

                describe("NONE", function() {
                    createMultiplesTest("HEALTHCHECK", "CMD ls", "instructionHealthcheckMultiple");
                });
            });
        });

        describe("unknown", function () {
            it("simple", function () {
                let diagnostics = validateDockerfile("FROM node\nRUNCMD docker");
                assert.equal(diagnostics.length, 1);
                assertInstructionUnknown(diagnostics[0], "RUNCMD", 1, 0, 1, 6);
                
                diagnostics = validateDockerfile("FR\\\nOM node");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nRUNCMD docker\n");
                assert.equal(diagnostics.length, 1);
                assertInstructionUnknown(diagnostics[0], "RUNCMD", 1, 0, 1, 6);

                diagnostics = validateDockerfile("FROM node\nRUNCMD docker\r\n");
                assert.equal(diagnostics.length, 1);
                assertInstructionUnknown(diagnostics[0], "RUNCMD", 1, 0, 1, 6);

                diagnostics = validateDockerfile("FROM node\nRUNCMD docker\\\n");
                assert.equal(diagnostics.length, 1);
                assertInstructionUnknown(diagnostics[0], "RUNCMD", 1, 0, 1, 6);

                diagnostics = validateDockerfile("FROM node\nR\\UN docker\n");
                assert.equal(diagnostics.length, 1);
                assertInstructionUnknown(diagnostics[0], "R\\UN", 1, 0, 1, 4);
            });

            it("escape", function () {
                let diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL\\\n9");
                assert.equal(diagnostics.length, 1);
                assertInstructionUnknown(diagnostics[0], "STOPSIGNAL9", 1, 0, 2, 1);

                diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL\\\n9 ");
                assert.equal(diagnostics.length, 1);
                assertInstructionUnknown(diagnostics[0], "STOPSIGNAL9", 1, 0, 2, 1);

                diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL\\\r\n9");
                assert.equal(diagnostics.length, 1);
                assertInstructionUnknown(diagnostics[0], "STOPSIGNAL9", 1, 0, 2, 1);

                diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL\\\r\n9 ");
                assert.equal(diagnostics.length, 1);
                assertInstructionUnknown(diagnostics[0], "STOPSIGNAL9", 1, 0, 2, 1);

                diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL\\ \n9");
                assert.equal(diagnostics.length, 1);
                assertInstructionUnknown(diagnostics[0], "STOPSIGNAL9", 1, 0, 2, 1);

                diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL\\ \t\n9");
                assert.equal(diagnostics.length, 1);
                assertInstructionUnknown(diagnostics[0], "STOPSIGNAL9", 1, 0, 2, 1);

                diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL\\  \n9");
                assert.equal(diagnostics.length, 1);
                assertInstructionUnknown(diagnostics[0], "STOPSIGNAL9", 1, 0, 2, 1);

                diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL\\ \r\n9");
                assert.equal(diagnostics.length, 1);
                assertInstructionUnknown(diagnostics[0], "STOPSIGNAL9", 1, 0, 2, 1);

                diagnostics = validateDockerfile("FROM alpine\nEXPOS\\8080");
                assert.equal(diagnostics.length, 1);
                assertInstructionUnknown(diagnostics[0], "EXPOS\\8080", 1, 0, 1, 10);

                diagnostics = validateDockerfile("FROM alpine\nEXPOS\\ 8080");
                assert.equal(diagnostics.length, 1);
                assertInstructionUnknown(diagnostics[0], "EXPOS\\", 1, 0, 1, 6);

                diagnostics = validateDockerfile("FROM alpine\nEXPOS\\  8080");
                assert.equal(diagnostics.length, 1);
                assertInstructionUnknown(diagnostics[0], "EXPOS\\", 1, 0, 1, 6);

                diagnostics = validateDockerfile("\\FROM node");
                assert.equal(diagnostics.length, 2);
                assertDiagnostics(diagnostics,
                    [ ValidationCode.UNKNOWN_INSTRUCTION, ValidationCode.NO_SOURCE_IMAGE ],
                    [ assertInstructionUnknown, assertNoSourceImage ],
                    [ [ "\\FROM", 0, 0, 0, 5 ], [ 0, 0, 0, 5 ] ]);

                diagnostics = validateDockerfile("FROM alpine\nRU\\N\nRUN echo");
                assert.equal(diagnostics.length, 1);
                assertInstructionUnknown(diagnostics[0], "RU\\N", 1, 0, 1, 4);
            });

            /**
             * Checks that an unknown instruction that is written in lowercase only
             * receives one error about the unknown instruction.
             */
            it("does not overlap with casing", function () {
                let diagnostics = validateDockerfile("FROM node\nruncmd docker");
                assert.equal(diagnostics.length, 1);
                assertInstructionUnknown(diagnostics[0], "RUNCMD", 1, 0, 1, 6);
            });
        });

        describe("first instruction not FROM", function() {
            it("one line", function() {
                let diagnostics = validateDockerfile("EXPOSE 8080");
                assert.equal(diagnostics.length, 1);
                assertNoSourceImage(diagnostics[0], 0, 0, 0, 6);
            });

            it("two lines", function() {
                let diagnostics = validateDockerfile("EXPOSE 8080\n# another line");
                assert.equal(diagnostics.length, 1);
                assertNoSourceImage(diagnostics[0], 0, 0, 0, 6);
            });

            it("two instructions", function() {
                let diagnostics = validateDockerfile("EXPOSE 8080\nEXPOSE 8081");
                assert.equal(diagnostics.length, 1);
                assertNoSourceImage(diagnostics[0], 0, 0, 0, 6);
            });

            it("comments ignored", function() {
                let diagnostics = validateDockerfile("# FROM node\nEXPOSE 8080");
                assert.equal(diagnostics.length, 1);
                assertNoSourceImage(diagnostics[0], 1, 0, 1, 6);
            });
        });

        describe("ARG before FROM", function() {
            it("single", function() {
                let diagnostics = validateDockerfile("ARG x\nFROM node");
                assert.equal(diagnostics.length, 0);
            });

            it("double", function() {
                let diagnostics = validateDockerfile("ARG x\nARG y\nFROM node");
                assert.equal(diagnostics.length, 0);
            });
        });

        describe("ARG before EXPOSE", function() {
            it("invalid", function() {
                let diagnostics = validateDockerfile("ARG x\nEXPOSE 8080");
                assert.equal(diagnostics.length, 1);
                assertNoSourceImage(diagnostics[0], 1, 0, 1, 6);
            });
        });

        describe("ARG only", function() {
            it("invalid", function() {
                let diagnostics = validateDockerfile("ARG x\nARG y\nARG z");
                assert.equal(diagnostics.length, 1);
                assertNoSourceImage(diagnostics[0], 0, 0, 0, 0);
            });
        });

        describe("empty continuation lines", function() {
            describe("simple", function() {
                it("default", function() {
                    let validator = new Validator();
                    let diagnostics = validator.validate(createDocument("FROM busybox\nRUN echo hello && \\\n    \necho world"));
                    assert.equal(diagnostics.length, 1);
                    assertEmptyContinuationLine(diagnostics[0], DiagnosticSeverity.Warning, 2, 0, 3, 0);
                });

                it("ignore", function() {
                    let diagnostics = validateDockerfile("FROM busybox\nRUN echo hello && \\\n    \necho world", { emptyContinuationLine: ValidationSeverity.IGNORE });
                    assert.equal(diagnostics.length, 0);
                });

                it("warning", function() {
                    let diagnostics = validateDockerfile("FROM busybox\nRUN echo hello && \\\n    \necho world", { emptyContinuationLine: ValidationSeverity.WARNING });
                    assert.equal(diagnostics.length, 1);
                    assertEmptyContinuationLine(diagnostics[0], DiagnosticSeverity.Warning, 2, 0, 3, 0);
                });

                it("error", function() {
                    let diagnostics = validateDockerfile("FROM busybox\nRUN echo hello && \\\n    \necho world", { emptyContinuationLine: ValidationSeverity.ERROR });
                    assert.equal(diagnostics.length, 1);
                    assertEmptyContinuationLine(diagnostics[0], DiagnosticSeverity.Error, 2, 0, 3, 0);
                });

                it("multiline", function() {
                    let diagnostics = validateDockerfile("FROM busybox\nEXPOSE 8080 \\\n\n\n8081", { emptyContinuationLine: ValidationSeverity.ERROR });
                    assert.equal(diagnostics.length, 1);
                    assertEmptyContinuationLine(diagnostics[0], DiagnosticSeverity.Error, 2, 0, 4, 0);

                    diagnostics = validateDockerfile("FROM busybox\nEXPOSE 8080 \\\n\n\n", { emptyContinuationLine: ValidationSeverity.ERROR });
                    assert.equal(diagnostics.length, 1);
                    assertEmptyContinuationLine(diagnostics[0], DiagnosticSeverity.Error, 2, 0, 5, 0);
                });
            });

            describe("onbuild", function() {
                it("default", function() {
                    let validator = new Validator();
                    let diagnostics = validator.validate(createDocument("FROM busybox\nONBUILD \\\n    \nRUN echo hello && \\\n    \necho world"));
                    assert.equal(diagnostics.length, 2);
                    assertEmptyContinuationLine(diagnostics[0], DiagnosticSeverity.Warning, 2, 0, 3, 0);
                    assertEmptyContinuationLine(diagnostics[1], DiagnosticSeverity.Warning, 4, 0, 5, 0);
                });

                it("ignore", function() {
                    let diagnostics = validateDockerfile("FROM busybox\nONBUILD \\\n    \nRUN echo hello && \\\n    \necho world", { emptyContinuationLine: ValidationSeverity.IGNORE });
                    assert.equal(diagnostics.length, 0);
                });

                it("warning", function() {
                    let diagnostics = validateDockerfile("FROM busybox\nONBUILD \\\n    \nRUN echo hello && \\\n    \necho world", { emptyContinuationLine: ValidationSeverity.WARNING });
                    assert.equal(diagnostics.length, 2);
                    assertEmptyContinuationLine(diagnostics[0], DiagnosticSeverity.Warning, 2, 0, 3, 0);
                    assertEmptyContinuationLine(diagnostics[1], DiagnosticSeverity.Warning, 4, 0, 5, 0);
                });

                it("error", function() {
                    let diagnostics = validateDockerfile("FROM busybox\nONBUILD \\\n    \nRUN echo hello && \\\n    \necho world", { emptyContinuationLine: ValidationSeverity.ERROR });
                    assert.equal(diagnostics.length, 2);
                    assertEmptyContinuationLine(diagnostics[0], DiagnosticSeverity.Error, 2, 0, 3, 0);
                    assertEmptyContinuationLine(diagnostics[1], DiagnosticSeverity.Error, 4, 0, 5, 0);
                });

                it("multiline", function() {
                    let diagnostics = validateDockerfile("FROM busybox\nONBUILD EXPOSE 8080 \\\n\n\n8081", { emptyContinuationLine: ValidationSeverity.ERROR });
                    assert.equal(diagnostics.length, 1);
                    assertEmptyContinuationLine(diagnostics[0], DiagnosticSeverity.Error, 2, 0, 4, 0);

                    diagnostics = validateDockerfile("FROM busybox\nONBUILD EXPOSE 8080 \\\n\n\n", { emptyContinuationLine: ValidationSeverity.ERROR });
                    assert.equal(diagnostics.length, 1);
                    assertEmptyContinuationLine(diagnostics[0], DiagnosticSeverity.Error, 2, 0, 5, 0);
                });
            });
        });
    });

    describe("variables", function() {
        function createVariablesTest(prefix: string, suffix?: string) {
            const length = prefix.length;
            if (suffix === undefined) {
                suffix = "";
            }

            it("ok", function() {
                let diagnostics = validateDockerfile("FROM scratch\nENV bbb=123\n" + prefix + "$bbb" + suffix); 
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM scratch\nENV bbb=123\n" + prefix + "${bbb}" + suffix); 
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM scratch\nENV bbb=123\n" + prefix + "${bbb:+x}" + suffix); 
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM scratch\nENV bbb=123\n" + prefix + "${bbb:-x}" + suffix); 
                assert.equal(diagnostics.length, 0);
            });

            it("unsupported modifier", function() {
                let diagnostics = validateDockerfile("FROM scratch\nENV bbb=123\n" + prefix + "${bbb:x}" + suffix);
                if (prefix === "CMD " || prefix === "ENTRYPOINT " || prefix === "RUN ") {
                    assert.equal(diagnostics.length, 0);
                } else {
                    assert.equal(diagnostics.length, 1);
                    assertVariableModifierUnsupported(diagnostics[0], "${bbb:x}", 'x', 2, length + 6, 2, length + 7);
                }

                diagnostics = validateDockerfile("FROM scratch\nENV bbb=123\n" + prefix + "${bbb:}" + suffix);
                if (prefix === "CMD " || prefix === "ENTRYPOINT " || prefix === "RUN ") {
                    assert.equal(diagnostics.length, 0);
                } else {
                    assert.equal(diagnostics.length, 1);
                    assertVariableModifierUnsupported(diagnostics[0], "${bbb:}", "", 2, length, 2, length + 7);
                }
            });

            it("question mark modifier", function() {
                let diagnostics = validateDockerfile("FROM scratch\nENV bbb=123\n" + prefix + "${bbb:?}" + suffix);
                assert.equal(diagnostics.length, 0);
            });

            it("no modifier", function() {
                let diagnostics = validateDockerfile("FROM mcr.microsoft.com/windows/servercore:ltsc2019\nENV Env=123\n" + prefix + "${Env:TEMP}" + suffix);
                if (prefix === "CMD " || prefix === "ENTRYPOINT " || prefix === "RUN ") {
                    assert.equal(diagnostics.length, 0);
                } else {
                    assert.equal(diagnostics.length, 1);
                    assertVariableModifierUnsupported(diagnostics[0], "${Env:TEMP}", 'T', 2, length + 6, 2, length + 7);
                }
            });
        }

        describe("ADD", function() {
            createVariablesTest("ADD test.txt ");
        });

        describe("ARG", function() {
            createVariablesTest("ARG aaa=");
        });

        describe("CMD", function() {
            createVariablesTest("CMD ");
        });

        describe("COPY", function() {
            createVariablesTest("COPY test.txt ");
        });

        describe("ENTRYPOINT", function() {
            createVariablesTest("ENTRYPOINT ");
        });

        describe("ENV", function() {
            createVariablesTest("ENV aaa=");
        });

        describe("EXPOSE", function() {
            createVariablesTest("EXPOSE ");
        });

        describe("FROM", function() {
            createVariablesTest("FROM localho");
        });

        describe("HEALTHCHECK", function() {
            createVariablesTest("HEALTHCHECK CMD ");
        });

        describe("LABEL", function() {
            createVariablesTest("LABEL aaa=");
        });

        describe("MAINTAINER", function() {
            createVariablesTest("MAINTAINER ");
        });

        describe("ONBUILD", function() {
            createVariablesTest("ONBUILD CMD ");
        });

        describe("RUN", function() {
            createVariablesTest("RUN ");
        });

        describe("SHELL", function() {
            createVariablesTest("SHELL [ \"", "\"] ");
        });

        describe("STOPSIGNAL", function() {
            createVariablesTest("STOPSIGNAL ");
        });

        describe("USER", function() {
            createVariablesTest("USER ");
        });

        describe("VOLUME", function() {
            createVariablesTest("VOLUME ");
        });

        describe("WORKDIR", function() {
            createVariablesTest("WORKDIR ");
        });
    });

    describe("directives", function() {
        describe("unknown directive", function() {
            it("simple", function() {
                let diagnostics = validateDockerfile("# key=value\nFROM node");
                assert.equal(diagnostics.length, 0);
            });

            it("simple EOF", function() {
                let diagnostics = validateDockerfile("# key=value");
                assert.equal(diagnostics.length, 1);
                assertNoSourceImage(diagnostics[0], 0, 0, 0, 0);
            });

            it("whitespace", function() {
                let diagnostics = validateDockerfile("# key = value\nFROM node");
                assert.equal(diagnostics.length, 0);
            });

            it("ignored after one comment", function() {
                let diagnostics = validateDockerfile("# This is a comment\n# key=value\nFROM node");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("#\n# key=value\nFROM node");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("#=# key=value\nFROM node");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("#=# key=value\r\nFROM node");
                assert.equal(diagnostics.length, 0);
            });

            it("ignored after one instruction", function() {
                let diagnostics = validateDockerfile("FROM node\n# key=value");
                assert.equal(diagnostics.length, 0);
            });
        });

        describe("escape validation", function() {
            it("backtick", function() {
                let diagnostics = validateDockerfile("# escape=`\nFROM node");
                assert.equal(diagnostics.length, 0);
            });

            it("whitespace around the value", function() {
                let diagnostics = validateDockerfile("# escape =  `  \nFROM node");
                assert.equal(diagnostics.length, 0);
            });

            it("invalid escape directive", function() {
                let diagnostics = validateDockerfile("# escape=ab\nFROM node");
                assert.equal(diagnostics.length, 1);
                assertDirectiveEscapeInvalid(diagnostics[0], "ab", 0, 9, 0, 11);

                diagnostics = validateDockerfile("# escape=ab\r\nFROM node");
                assert.equal(diagnostics.length, 1);
                assertDirectiveEscapeInvalid(diagnostics[0], "ab", 0, 9, 0, 11);
            });

            it("value cannot be whitespace", function() {
                let diagnostics = validateDockerfile("#escape= \nFROM node");
                assert.equal(diagnostics.length, 1);
                assertDirectiveEscapeInvalid(diagnostics[0], " ", 0, 8, 0, 9);
                
                diagnostics = validateDockerfile("#escape=\t\nFROM node");
                assert.equal(diagnostics.length, 1);
                assertDirectiveEscapeInvalid(diagnostics[0], "\t", 0, 8, 0, 9);
            });

            it("EOF", function() {
                let diagnostics = validateDockerfile("#escape=");
                assert.equal(diagnostics.length, 1);
                assertNoSourceImage(diagnostics[0], 0, 0, 0, 0);
            });

            it("EOF newline", function() {
                let diagnostics = validateDockerfile("#escape=\n");
                assert.equal(diagnostics.length, 1);
                assertNoSourceImage(diagnostics[0], 0, 0, 0, 0);
            });

            it("ignored on second line", function() {
                let diagnostics = validateDockerfile("\n# escape=a\nFROM node");
                assert.equal(diagnostics.length, 0);
            });

            it("duplicated escape directive", function() {
                let diagnostics = validateDockerfile("# escape=`\n# escape=`\nFROM alpine");
                assert.equal(diagnostics.length, 2);
                assertDirectiveEscapeDuplicated(diagnostics[0], 0, 2, 0, 10);
                assertDirectiveEscapeDuplicated(diagnostics[1], 1, 2, 1, 10);
            });
        });

        describe("escape casing", function() {
            it("lowercase", function() {
                let diagnostics = validateDockerfile("# escape=`\nFROM node");
                assert.equal(diagnostics.length, 0);
            });

            it("mixed", function() {
                let diagnostics = validateDockerfile("# esCAPe=`\nFROM node");
                assert.equal(diagnostics.length, 1);
                assertDirectiveCasing(diagnostics[0], DiagnosticSeverity.Warning, 0, 2, 0, 8);
            });

            it("uppercase", function() {
                let diagnostics = validateDockerfile("# ESCAPE=`\nFROM node");
                assert.equal(diagnostics.length, 1);
                assertDirectiveCasing(diagnostics[0], DiagnosticSeverity.Warning, 0, 2, 0, 8);
            });

            it("default", function() {
                let validator = new Validator();
                let diagnostics = validator.validate(createDocument("# esCAPe=`\nFROM node"));
                assert.equal(diagnostics.length, 1);
                assertDirectiveCasing(diagnostics[0], DiagnosticSeverity.Warning, 0, 2, 0, 8);
            });

            it("ignore", function() {
                let diagnostics = validateDockerfile("# esCAPe=`\nFROM node", { directiveCasing: ValidationSeverity.IGNORE });
                assert.equal(diagnostics.length, 0);
            });

            it("warning", function() {
                let diagnostics = validateDockerfile("# esCAPe=`\nFROM node", { directiveCasing: ValidationSeverity.WARNING });
                assert.equal(diagnostics.length, 1);
                assertDirectiveCasing(diagnostics[0], DiagnosticSeverity.Warning, 0, 2, 0, 8);
            });

            it("error", function() {
                let diagnostics = validateDockerfile("# esCAPe=`\nFROM node", { directiveCasing: ValidationSeverity.ERROR });
                assert.equal(diagnostics.length, 1);
                assertDirectiveCasing(diagnostics[0], DiagnosticSeverity.Error, 0, 2, 0, 8);
            });

            it("ignored on second line", function() {
                let diagnostics = validateDockerfile("\n# esCAPe=a\nFROM node");
                assert.equal(diagnostics.length, 0);
            });
        });
    });

    function createSingleQuotedJSONTests(instruction: string) {
        describe("JSON in single quotes", function() {
            let line = instruction + " ['/bin/bash', 'echo']";
            let content = "FROM busybox\n" + line;
            let instructionLength = instruction.length;

            it("default", function() {
                let diagnostics = validate(content);
                assert.equal(diagnostics.length, 1);
                assertInstructionJSONInSingleQuotes(diagnostics[0], DiagnosticSeverity.Warning, 1, instructionLength + 1, 1, instructionLength + 22);

                diagnostics = validate("FROM busybox\n" + instruction + " ['/bin/bash', 'echo',]");
                assert.equal(diagnostics.length, 1);
                assertInstructionJSONInSingleQuotes(diagnostics[0], DiagnosticSeverity.Warning, 1, instructionLength + 1, 1, instructionLength + 23);

                diagnostics = validate("FROM busybox\n" + instruction + " [ '],',]");
                assert.equal(diagnostics.length, 1);
                assertInstructionJSONInSingleQuotes(diagnostics[0], DiagnosticSeverity.Warning, 1, instructionLength + 1, 1, instructionLength + 9);
            });

            it("ignore", function() {
                let diagnostics = validate(content, { instructionJSONInSingleQuotes: ValidationSeverity.IGNORE });
                assert.equal(diagnostics.length, 0);
            });

            it("warning", function() {
                let diagnostics = validate(content, { instructionJSONInSingleQuotes: ValidationSeverity.WARNING });
                assert.equal(diagnostics.length, 1);
                assertInstructionJSONInSingleQuotes(diagnostics[0], DiagnosticSeverity.Warning, 1, instructionLength + 1, 1, instructionLength + 22);
            });

            it("error", function() {
                let diagnostics = validate(content, { instructionJSONInSingleQuotes: ValidationSeverity.ERROR });
                assert.equal(diagnostics.length, 1);
                assertInstructionJSONInSingleQuotes(diagnostics[0], DiagnosticSeverity.Error, 1, instructionLength + 1, 1, instructionLength + 22);
            });
        });
    }

    describe("ADD", function() {
        describe("arguments", function() {
            it("ok", function() {
                let diagnostics = validateDockerfile("FROM alpine\nADD . .");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nADD Dockerfile Dockerfile2 /root/");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nADD Dockerfile Dockerfile2 $root");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nADD Dockerfile Dockerfile2 ${root}");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nADD Dockerfile Dockerfile2 C:\\tmp\\");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nADD [ \"Dockerfile\", \"/root\" ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nADD [ \"Dockerfile\", \"C:\\tmp\" ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nADD [\"Dockerfile\",\"/root\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nADD [\"Dockerfile\",\"C:\\tmp\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nADD [\"Dockerfile\", \"/root\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nADD [\"Dockerfile\", \"C:\\tmp\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nADD [ \"Dockerfile\", \"Dockerfile2\", \"/root/\" ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nADD [ \"Dockerfile\", \"Dockerfile2\", \"C:\\tmp\\\\\" ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nADD [\"Dockerfile\",\"Dockerfile2\",\"/root/\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nADD [\"Dockerfile\",\"Dockerfile2\",\"$root\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nADD [\"Dockerfile\",\"Dockerfile2\",\"${root}\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nADD [\"Dockerfile\", \"Dockerfile2\",\"$root\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nADD [\"Dockerfile\", \"Dockerfile2\",\"${root}\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nADD [ \"Dockerfile\", \"Dockerfile2\", \"$root\" ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nADD [ \"Dockerfile\", \"Dockerfile2\", \"${root}\" ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nADD [\"Dockerfile\",\"Dockerfile2\",\"C:\\tmp\\\\\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nADD [\"Dockerfile\",\"Dockerfile2\",\"/root/\" ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nADD [\"Dockerfile\",\"Dockerfile2\",\"C:\\tmp\\\\\" ]");
                assert.equal(diagnostics.length, 0);
            });

            it("requires at least two", function() {
                let diagnostics = validateDockerfile("FROM alpine\nADD ");
                assert.equal(diagnostics.length, 1);
                assertADDRequiresAtLeastTwoArguments(diagnostics[0], 1, 0, 1, 3);

                diagnostics = validateDockerfile("FROM alpine\nADD .");
                assert.equal(diagnostics.length, 1);
                assertADDRequiresAtLeastTwoArguments(diagnostics[0], 1, 4, 1, 5);

                diagnostics = validateDockerfile("FROM alpine\nADD []");
                assert.equal(diagnostics.length, 1);
                assertADDRequiresAtLeastTwoArguments(diagnostics[0], 1, 4, 1, 6);

                diagnostics = validateDockerfile("FROM alpine\nADD [ ]");
                assert.equal(diagnostics.length, 1);
                assertADDRequiresAtLeastTwoArguments(diagnostics[0], 1, 4, 1, 7);

                diagnostics = validateDockerfile("FROM alpine\nADD [\"test.txt\"]");
                assert.equal(diagnostics.length, 1);
                assertADDRequiresAtLeastTwoArguments(diagnostics[0], 1, 6, 1, 14);

                diagnostics = validateDockerfile("FROM alpine\nADD [\"test.txt\" ]");
                assert.equal(diagnostics.length, 1);
                assertADDRequiresAtLeastTwoArguments(diagnostics[0], 1, 6, 1, 14);

                diagnostics = validateDockerfile("FROM alpine\nADD --chown=root:root");
                assert.equal(diagnostics.length, 1);
                assertADDRequiresAtLeastTwoArguments(diagnostics[0], 1, 0, 1, 3);

                diagnostics = validateDockerfile("FROM alpine\nADD --chown=root:root .");
                assert.equal(diagnostics.length, 1);
                assertADDRequiresAtLeastTwoArguments(diagnostics[0], 1, 22, 1, 23);

                diagnostics = validateDockerfile("FROM alpine\nADD --chown=root:root [\"test.txt\"]");
                assert.equal(diagnostics.length, 1);
                assertADDRequiresAtLeastTwoArguments(diagnostics[0], 1, 24, 1, 32);
            });

            it("destination not a directory", function() {
                let diagnostics = validateDockerfile("FROM alpine\nADD Dockerfile Dockerfile2 /root");
                assert.equal(diagnostics.length, 1);
                assertADDDestinationNotDirectory(diagnostics[0], 1, 27, 1, 32);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nADD Dockerfile Dockerfile2 C:\\tmp");
                assert.equal(diagnostics.length, 1);
                assertADDDestinationNotDirectory(diagnostics[0], 2, 27, 2, 33);

                diagnostics = validateDockerfile("FROM alpine\nADD [ \"Dockerfile\", \"Dockerfile2\", \"/root\" ]");
                assert.equal(diagnostics.length, 1);
                assertADDDestinationNotDirectory(diagnostics[0], 1, 36, 1, 41);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nADD [ \"Dockerfile\", \"Dockerfile2\", \"C:\\tmp\" ]");
                assert.equal(diagnostics.length, 1);
                assertADDDestinationNotDirectory(diagnostics[0], 2, 36, 2, 42);

                diagnostics = validateDockerfile("FROM alpine\nADD [\"Dockerfile\",\"Dockerfile2\",\"/root\"]");
                assert.equal(diagnostics.length, 1);
                assertADDDestinationNotDirectory(diagnostics[0], 1, 33, 1, 38);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nADD [\"Dockerfile\",\"Dockerfile2\",\"C:\\tmp\"]");
                assert.equal(diagnostics.length, 1);
                assertADDDestinationNotDirectory(diagnostics[0], 2, 33, 2, 39);

                diagnostics = validateDockerfile("FROM alpine\nADD [\"Dockerfile\",\"Dockerfile2\",\"/root\" ]");
                assert.equal(diagnostics.length, 1);
                assertADDDestinationNotDirectory(diagnostics[0], 1, 33, 1, 38);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nADD [\"Dockerfile\",\"Dockerfile2\",\"C:\\tmp\" ]");
                assert.equal(diagnostics.length, 1);
                assertADDDestinationNotDirectory(diagnostics[0], 2, 33, 2, 39);
            });
        });

        describe("flags", function() {
            describe("chmod", () => {
                it("ok", () => {
                    let diagnostics = validateDockerfile("FROM node\nADD --chmod=644 . .");
                    assert.equal(diagnostics.length, 0);
                });

                it("flag no value", () => {
                    let diagnostics = validateDockerfile("FROM alpine\nADD --chmod . .");
                    assert.equal(diagnostics.length, 1);
                    assertFlagMissingValue(diagnostics[0], "chmod", 1, 6, 1, 11);
                });

                it("duplicate flag", () => {
                    let diagnostics = validateDockerfile("FROM alpine\nADD --chmod=644 --chmod=755 . .");
                    assert.equal(diagnostics.length, 2);
                    assertFlagDuplicate(diagnostics[0], "chmod", 1, 6, 1, 11);
                    assertFlagDuplicate(diagnostics[1], "chmod", 1, 18, 1, 23);
                });
            });

            describe("chown", () => {
                it("ok", () => {
                    let diagnostics = validateDockerfile("FROM node\nADD --chown=node:node . .");
                    assert.equal(diagnostics.length, 0);
                });

                it("flag no value", () => {
                    let diagnostics = validateDockerfile("FROM alpine\nADD --chown . .");
                    assert.equal(diagnostics.length, 1);
                    assertFlagMissingValue(diagnostics[0], "chown", 1, 6, 1, 11);
                });

                it("duplicate flag", () => {
                    let diagnostics = validateDockerfile("FROM alpine\nADD --chown=x --chown=y . .");
                    assert.equal(diagnostics.length, 2);
                    assertFlagDuplicate(diagnostics[0], "chown", 1, 6, 1, 11);
                    assertFlagDuplicate(diagnostics[1], "chown", 1, 16, 1, 21);
                });
            });

            it("unknown flag", function() {
                let diagnostics = validateDockerfile("FROM alpine\nADD --x=bb . .");
                assert.equal(diagnostics.length, 1);
                assertUnknownAddFlag(diagnostics[0], "x", 1, 4, 1, 7);

                diagnostics = validateDockerfile("FROM alpine\nADD --chown=bb --x . .");
                assert.equal(diagnostics.length, 1);
                assertUnknownAddFlag(diagnostics[0], "x", 1, 15, 1, 18);

                diagnostics = validateDockerfile("FROM alpine\nADD --x --chown=bb . .");
                assert.equal(diagnostics.length, 1);
                assertUnknownAddFlag(diagnostics[0], "x", 1, 4, 1, 7);

                // empty name
                diagnostics = validateDockerfile("FROM alpine\nADD -- . .");
                assert.equal(diagnostics.length, 1);
                assertUnknownAddFlag(diagnostics[0], "", 1, 4, 1, 6);

                // empty value
                diagnostics = validateDockerfile("FROM alpine\nADD --x= . .");
                assert.equal(diagnostics.length, 1);
                assertUnknownAddFlag(diagnostics[0], "x", 1, 4, 1, 7);

                // no equals sign
                diagnostics = validateDockerfile("FROM alpine\nADD --x . .");
                assert.equal(diagnostics.length, 1);
                assertUnknownAddFlag(diagnostics[0], "x", 1, 4, 1, 7);

                // flags are case-sensitive
                diagnostics = validateDockerfile("FROM alpine\nADD --CHOWN=bb . .");
                assert.equal(diagnostics.length, 1);
                assertUnknownAddFlag(diagnostics[0], "CHOWN", 1, 4, 1, 11);
            });
        });

        createSingleQuotedJSONTests("ADD");
    });

    function createSingleNameValuePairTests(instruction: string) {
        let instructionLength = instruction.length;

        it("ok", function() {
            // valid as the variable is equal to the empty string in this case
            testValidArgument(instruction, "a=");
            testValidArgument(instruction, "a=b");
            testValidArgument(instruction, "a=\"a b\"");
            testValidArgument(instruction, "a='a b'");
            testValidArgument(instruction, "'a'=b");
            testValidArgument(instruction, "'a'=\"a b\"");
            testValidArgument(instruction, "'a'='a b'");
            testValidArgument(instruction, "\"a\"=b");
            testValidArgument(instruction, "\"a\"=\"a b\"");
            testValidArgument(instruction, "\"a\"='a b'");

            let diagnostics = validateDockerfile("FROM node\n" + instruction + " a='\\'");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " a='\\\\'");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " var='a\\\nb'");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " var='a\\ \nb'");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " var=\"a\\\nb\"");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " var=\"a\\ \nb\"");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " var=\"\\\"\\\"\"");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " var=value \\\n# var2=value2");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " AAA=${aaa:-'bbb'}");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " AAA=${aaa:-'bbb ccc'}");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " AAA=${aaa:-\"bbb\"");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " AAA=${aaa:-\"bbb\"}");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " AAA=${aaa:-\"bbb ccc\"}");
            assert.equal(diagnostics.length, 0);
        });

        it("escape", function() {
            testValidArgument(instruction, "a=a\\ x");
            testValidArgument(instruction, "a=a\\");
            testValidArgument(instruction, "a=a\\b");
            testValidArgument(instruction, "a=a\\\\b");
            testValidArgument(instruction, "a=\"a\\ x\"");
            testValidArgument(instruction, "a='a\\ x'");
            testValidArgument(instruction, "a=a\\\nx");
            testValidArgument(instruction, "a=a\\ \nx");
            testValidArgument(instruction, "a=a\\\rx");
            testValidArgument(instruction, "a=a\\ \rx");
            testValidArgument(instruction, "a=a\\\r\nx");
            testValidArgument(instruction, "a=a\\ \r\nx");
            testValidArgument(instruction, "a=\"a \\\nx\"");
            testValidArgument(instruction, "a=\"a \\\rx\"");
            testValidArgument(instruction, "a=\"a \\\r\nx\"");
            testValidArgument(instruction, "a=\'a \\\nx'");
            testValidArgument(instruction, "a=\'a \\\rx'");
            testValidArgument(instruction, "a=\'a \\\r\nx'");
        });

        it("missing name", function() {
            let diagnostics = validateDockerfile("FROM node\n" + instruction + " =value");
            assert.equal(diagnostics.length, 1);
            assertSyntaxMissingNames(diagnostics[0], instruction, 1, instructionLength + 1, 1, instructionLength + 7);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " =");
            assert.equal(diagnostics.length, 1);
            assertSyntaxMissingNames(diagnostics[0], instruction, 1, instructionLength + 1, 1, instructionLength + 2);
        });

        it("syntax missing single quote", function() {
            let diagnostics = validateDockerfile("FROM node\n" + instruction + " var='value");
            assert.equal(diagnostics.length, 1);
            assertSyntaxMissingSingleQuote(diagnostics[0], "'value", 1, instructionLength + 5, 1, instructionLength + 11);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " var='val\\\nue");
            assert.equal(diagnostics.length, 1);
            assertSyntaxMissingSingleQuote(diagnostics[0], "'value", 1, instructionLength + 5, 2, 2);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " 'abc=xyz");
            assert.equal(diagnostics.length, 1);
            assertSyntaxMissingSingleQuote(diagnostics[0], "'abc", 1, instructionLength + 1, 1, instructionLength + 5);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " 'abc=xyz'");
            assert.equal(diagnostics.length, 1);
            assertSyntaxMissingSingleQuote(diagnostics[0], "'abc", 1, instructionLength + 1, 1, instructionLength + 5);
        });

        it("syntax missing double quote", function() {
            let diagnostics = validateDockerfile("FROM node\n" + instruction + " var=\"value");
            assert.equal(diagnostics.length, 1);
            assertSyntaxMissingDoubleQuote(diagnostics[0], "\"value", 1, instructionLength + 5, 1, instructionLength + 11);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " var=\"value\\");
            assert.equal(diagnostics.length, 1);
            assertSyntaxMissingDoubleQuote(diagnostics[0], "\"value\\", 1, instructionLength + 5, 1, instructionLength + 12);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " var=\"value\\\"");
            assert.equal(diagnostics.length, 1);
            assertSyntaxMissingDoubleQuote(diagnostics[0], "\"value\\\"", 1, instructionLength + 5, 1, instructionLength + 13);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " var=\"a\\  ");
            assert.equal(diagnostics.length, 1);
            assertSyntaxMissingDoubleQuote(diagnostics[0], "\"a\\", 1, instructionLength + 5, 1, instructionLength + 8);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " var=\"a\\  b");
            assert.equal(diagnostics.length, 1);
            assertSyntaxMissingDoubleQuote(diagnostics[0], "\"a\\  b", 1, instructionLength + 5, 1, instructionLength + 11);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " var=\"val\\\nue");
            assert.equal(diagnostics.length, 1);
            assertSyntaxMissingDoubleQuote(diagnostics[0], "\"value", 1, instructionLength + 5, 2, 2);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " var=\"val\\\r\nue");
            assert.equal(diagnostics.length, 1);
            assertSyntaxMissingDoubleQuote(diagnostics[0], "\"value", 1, instructionLength + 5, 2, 2);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " \"abc=xyz");
            assert.equal(diagnostics.length, 1);
            assertSyntaxMissingDoubleQuote(diagnostics[0], "\"abc", 1, instructionLength + 1, 1, instructionLength + 5);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " \"abc=xyz\"");
            assert.equal(diagnostics.length, 1);
            assertSyntaxMissingDoubleQuote(diagnostics[0], "\"abc", 1, instructionLength + 1, 1, instructionLength + 5);
        });
    }

    describe("ARG", function() {
        createSingleNameValuePairTests("ARG");

        it("accepts more than one argument (new in Docker Engine 20.10)", function() {
            let diagnostics = validateDockerfile("FROM busybox\nARG a=a b");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nARG a=a\\  b");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nARG a=a\\\\ b");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nARG a=a\\\n b");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nARG a=a\\\r\n b");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nARG a=a\\ \\b \\c");
            assert.equal(diagnostics.length, 0);
        });
    });

    describe("CMD", function() {
        describe("arguments", function() {
            it("ok", function() {
                let diagnostics = validate("FROM alpine\nCMD [ t.txt");
                assert.equal(diagnostics.length, 0);

                diagnostics = validate("FROM alpine\nCMD '");
                assert.equal(diagnostics.length, 0);

                diagnostics = validate("FROM alpine\nCMD [ [");
                assert.equal(diagnostics.length, 0);

                diagnostics = validate("FROM alpine\nCMD , [ ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validate("FROM alpine\nCMD [ '],', '[]'");
                assert.equal(diagnostics.length, 0);

                diagnostics = validate("FROM alpine\nCMD [ '''");
                assert.equal(diagnostics.length, 0);

                diagnostics = validate("FROM alpine\nCMD ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validate("FROM alpine\nCMD [ ,,");
                assert.equal(diagnostics.length, 0);

                diagnostics = validate("FROM alpine\nCMD [ '\\a");
                assert.equal(diagnostics.length, 0);

                diagnostics = validate("FROM alpine\nCMD [ '\\\" \\ \t\na ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validate("FROM alpine\nCMD [ '\\\" \\ \t\r\na ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validate("FROM alpine\nCMD [ '\\\" \\ \t\n a ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validate("FROM alpine\nCMD [ '\\\" \\ \t\r\n a ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validate("FROM alpine\nCMD [ 'asdfasdf' , 's  sdfsfd \\ ', \\\n  'sdfsdf'");
                assert.equal(diagnostics.length, 0);

                diagnostics = validate("FROM alpine\nCMD [ \\a");
                assert.equal(diagnostics.length, 0);
            });
        });

        createSingleQuotedJSONTests("CMD");
    });

    describe("COPY", function() {
        describe("arguments", function() {
            it("ok", function() {
                let diagnostics = validateDockerfile("FROM alpine\nCOPY . .");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nCOPY Dockerfile Dockerfile2 /root/");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nCOPY Dockerfile Dockerfile2 $root");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nCOPY Dockerfile Dockerfile2 ${root}");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nCOPY Dockerfile Dockerfile2 C:\\tmp\\");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nCOPY [ \"Dockerfile\", \"/root\" ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nCOPY [ \"Dockerfile\", \"C:\\tmp\" ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nCOPY [\"Dockerfile\",\"/root\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nCOPY [\"Dockerfile\",\"C:\\tmp\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nCOPY [\"Dockerfile\", \"/root\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nCOPY [\"Dockerfile\", \"C:\\tmp\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nCOPY [ \"Dockerfile\", \"Dockerfile2\", \"/root/\" ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nCOPY [\"Dockerfile\",\"Dockerfile2\",\"$root\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nCOPY [\"Dockerfile\",\"Dockerfile2\",\"${root}\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nCOPY [\"Dockerfile\", \"Dockerfile2\",\"$root\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nCOPY [\"Dockerfile\", \"Dockerfile2\",\"${root}\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nCOPY [ \"Dockerfile\", \"Dockerfile2\", \"$root\" ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nCOPY [ \"Dockerfile\", \"Dockerfile2\", \"${root}\" ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nCOPY [ \"Dockerfile\", \"Dockerfile2\", \"C:\\tmp\\\\\" ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nCOPY [\"Dockerfile\",\"Dockerfile2\",\"/root/\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nCOPY [\"Dockerfile\",\"Dockerfile2\",\"C:\\tmp\\\\\"]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nCOPY [\"Dockerfile\",\"Dockerfile2\",\"/root/\" ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nCOPY [\"Dockerfile\",\"Dockerfile2\",\"C:\\tmp\\\\\" ]");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine\nCOPY 1.txt 2.txt \\\n 3.txt #4.txt /dir/");
                assert.equal(diagnostics.length, 0);
            });

            it("requires at least two", function() {
                let diagnostics = validateDockerfile("FROM alpine\nCOPY ");
                assert.equal(diagnostics.length, 1);
                assertCOPYRequiresAtLeastTwoArguments(diagnostics[0], 1, 0, 1, 4);

                diagnostics = validateDockerfile("FROM alpine\nCOPY .");
                assert.equal(diagnostics.length, 1);
                assertCOPYRequiresAtLeastTwoArguments(diagnostics[0], 1, 5, 1, 6);

                diagnostics = validateDockerfile("FROM alpine\nCOPY []");
                assert.equal(diagnostics.length, 1);
                assertCOPYRequiresAtLeastTwoArguments(diagnostics[0], 1, 5, 1, 7);

                diagnostics = validateDockerfile("FROM alpine\nCOPY [ ]");
                assert.equal(diagnostics.length, 1);
                assertCOPYRequiresAtLeastTwoArguments(diagnostics[0], 1, 5, 1, 8);

                diagnostics = validateDockerfile("FROM alpine\nCOPY [\"test.txt\"]");
                assert.equal(diagnostics.length, 1);
                assertCOPYRequiresAtLeastTwoArguments(diagnostics[0], 1, 7, 1, 15);

                diagnostics = validateDockerfile("FROM alpine\nCOPY [\"test.txt\" ]");
                assert.equal(diagnostics.length, 1);
                assertCOPYRequiresAtLeastTwoArguments(diagnostics[0], 1, 7, 1, 15);

                diagnostics = validateDockerfile("FROM alpine\nCOPY --from=busybox");
                assert.equal(diagnostics.length, 1);
                assertCOPYRequiresAtLeastTwoArguments(diagnostics[0], 1, 0, 1, 4);

                diagnostics = validateDockerfile("FROM alpine\nCOPY --from=busybox .");
                assert.equal(diagnostics.length, 1);
                assertCOPYRequiresAtLeastTwoArguments(diagnostics[0], 1, 20, 1, 21);

                diagnostics = validateDockerfile("FROM alpine\nCOPY --chown=root:root [\"test.txt\"]");
                assert.equal(diagnostics.length, 1);
                assertCOPYRequiresAtLeastTwoArguments(diagnostics[0], 1, 25, 1, 33);
            });

            it("destination not a directory", function() {
                let diagnostics = validateDockerfile("FROM alpine\nCOPY Dockerfile Dockerfile2 /root");
                assert.equal(diagnostics.length, 1);
                assertCOPYDestinationNotDirectory(diagnostics[0], 1, 28, 1, 33);

                diagnostics = validateDockerfile("FROM alpine\nCOPY a b /di\\\n\\\n\\r");
                assert.equal(diagnostics.length, 1);
                assertCOPYDestinationNotDirectory(diagnostics[0], 1, 9, 3, 2);

                diagnostics = validateDockerfile("#escape=`\nFROM alpine\nCOPY a b /di`\n`\n`r");
                assert.equal(diagnostics.length, 1);
                assertCOPYDestinationNotDirectory(diagnostics[0], 2, 9, 4, 2);

                diagnostics = validateDockerfile("FROM alpine\nCOPY a b \\\n\\ \n/dir");
                assert.equal(diagnostics.length, 1);
                assertCOPYDestinationNotDirectory(diagnostics[0], 3, 0, 3, 4);

                diagnostics = validateDockerfile("#escape=`\nFROM alpine\nCOPY a b `\n` \n/dir");
                assert.equal(diagnostics.length, 1);
                assertCOPYDestinationNotDirectory(diagnostics[0], 4, 0, 4, 4);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nCOPY Dockerfile Dockerfile2 C:\\tmp");
                assert.equal(diagnostics.length, 1);
                assertCOPYDestinationNotDirectory(diagnostics[0], 2, 28, 2, 34);

                diagnostics = validateDockerfile("FROM alpine\nCOPY [ \"Dockerfile\", \"Dockerfile2\", \"/root\" ]");
                assert.equal(diagnostics.length, 1);
                assertCOPYDestinationNotDirectory(diagnostics[0], 1, 37, 1, 42);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nCOPY [ \"Dockerfile\", \"Dockerfile2\", \"C:\\tmp\" ]");
                assert.equal(diagnostics.length, 1);
                assertCOPYDestinationNotDirectory(diagnostics[0], 2, 37, 2, 43);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nCOPY [ \"Dockerfile\", \"Dockerfile2\", \"C:\\tmp\" ]");
                assert.equal(diagnostics.length, 1);
                assertCOPYDestinationNotDirectory(diagnostics[0], 2, 37, 2, 43);

                diagnostics = validateDockerfile("FROM alpine\nCOPY [\"Dockerfile\",\"Dockerfile2\",\"/root\"]");
                assert.equal(diagnostics.length, 1);
                assertCOPYDestinationNotDirectory(diagnostics[0], 1, 34, 1, 39);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nCOPY [\"Dockerfile\",\"Dockerfile2\",\"C:\\tmp\"]");
                assert.equal(diagnostics.length, 1);
                assertCOPYDestinationNotDirectory(diagnostics[0], 2, 34, 2, 40);

                diagnostics = validateDockerfile("FROM alpine\nCOPY [\"Dockerfile\",\"Dockerfile2\",\"/root\" ]");
                assert.equal(diagnostics.length, 1);
                assertCOPYDestinationNotDirectory(diagnostics[0], 1, 34, 1, 39);

                diagnostics = validateDockerfile("#escape=`\nFROM microsoft/nanoserver\nCOPY [\"Dockerfile\",\"Dockerfile2\",\"C:\\tmp\" ]");
                assert.equal(diagnostics.length, 1);
                assertCOPYDestinationNotDirectory(diagnostics[0], 2, 34, 2, 40);
            });
        });

        describe("flags", function() {
            describe("chmod", function() {
                it("ok", function() {
                    let diagnostics = validateDockerfile("FROM node\nCOPY --chmod=644 . .");
                    assert.equal(diagnostics.length, 0);
                });

                it("no value", function() {
                    let diagnostics = validateDockerfile("FROM alpine\nCOPY --chmod . .");
                    assert.equal(diagnostics.length, 1);
                    assertFlagMissingValue(diagnostics[0], "chmod", 1, 7, 1, 12);
                });

                it("duplicate flag", function() {
                    let diagnostics = validateDockerfile("FROM alpine\nCOPY --chmod=644 --chmod=755 . .");
                    assert.equal(diagnostics.length, 2);
                    assertFlagDuplicate(diagnostics[0], "chmod", 1, 7, 1, 12);
                    assertFlagDuplicate(diagnostics[1], "chmod", 1, 19, 1, 24);
                });
            });

            describe("chown", function() {
                it("ok", function() {
                    let diagnostics = validateDockerfile("FROM node\nCOPY --chown=node:node . .");
                    assert.equal(diagnostics.length, 0);
                });

                it("no value", function() {
                    let diagnostics = validateDockerfile("FROM alpine\nCOPY --chown . .");
                    assert.equal(diagnostics.length, 1);
                    assertFlagMissingValue(diagnostics[0], "chown", 1, 7, 1, 12);
                });

                it("duplicate flag", function() {
                    let diagnostics = validateDockerfile("FROM alpine\nCOPY --chown=x --chown=y . .");
                    assert.equal(diagnostics.length, 2);
                    assertFlagDuplicate(diagnostics[0], "chown", 1, 7, 1, 12);
                    assertFlagDuplicate(diagnostics[1], "chown", 1, 17, 1, 22);
                });
            });

            describe("from", function() {
                it("ok", function() {
                    let diagnostics = validateDockerfile("FROM alpine\nFROM busybox AS bb\nCOPY --from=bb . .");
                    assert.equal(diagnostics.length, 0);
                });

                it("no value", function() {
                    let diagnostics = validateDockerfile("FROM alpine\nCOPY --from . .");
                    assert.equal(diagnostics.length, 1);
                    assertFlagMissingValue(diagnostics[0], "from", 1, 7, 1, 11);
                });

                it("empty value", function() {
                    let diagnostics = validateDockerfile("FROM alpine\nCOPY --from= . .");
                    assert.equal(diagnostics.length, 1);
                    assertFlagInvalidFrom(diagnostics[0], "", 1, 5, 1, 12);
                });

                it("invalid value", function() {
                    let diagnostics = validateDockerfile("FROM alpine\nCOPY --from=^ . .");
                    assert.equal(diagnostics.length, 1);
                    assertFlagInvalidFrom(diagnostics[0], "^", 1, 12, 1, 13);

                    diagnostics = validateDockerfile("FROM alpine\nCOPY --from=^abc . .");
                    assert.equal(diagnostics.length, 1);
                    assertFlagInvalidFrom(diagnostics[0], "^abc", 1, 12, 1, 16);
                });

                it("duplicate flag", function() {
                    let diagnostics = validateDockerfile("FROM alpine\nCOPY --from=x --from=y . .");
                    assert.equal(diagnostics.length, 2);
                    assertFlagDuplicate(diagnostics[0], "from", 1, 7, 1, 11);
                    assertFlagDuplicate(diagnostics[1], "from", 1, 16, 1, 20);
                });
            });

            it("all flags", function() {
                let diagnostics = validateDockerfile("FROM node AS bb\nFROM alpine\nCOPY --from=bb --chown=node:node . .");
                assert.equal(diagnostics.length, 0);
            });

            it("unknown flag", function() {
                let diagnostics = validateDockerfile("FROM alpine\nFROM busybox AS bb\nCOPY --x=bb . .");
                assert.equal(diagnostics.length, 1);
                assertUnknownCopyFlag(diagnostics[0], "x", 2, 5, 2, 8);

                diagnostics = validateDockerfile("FROM alpine\nFROM busybox AS bb\nCOPY --from=bb --x . .");
                assert.equal(diagnostics.length, 1);
                assertUnknownCopyFlag(diagnostics[0], "x", 2, 15, 2, 18);

                diagnostics = validateDockerfile("FROM alpine\nFROM busybox AS bb\nCOPY --x --from=bb . .");
                assert.equal(diagnostics.length, 1);
                assertUnknownCopyFlag(diagnostics[0], "x", 2, 5, 2, 8);

                // empty name
                diagnostics = validateDockerfile("FROM alpine\nFROM busybox AS bb\nCOPY -- . .");
                assert.equal(diagnostics.length, 1);
                assertUnknownCopyFlag(diagnostics[0], "", 2, 5, 2, 7);

                // empty value
                diagnostics = validateDockerfile("FROM alpine\nFROM busybox AS bb\nCOPY --x= . .");
                assert.equal(diagnostics.length, 1);
                assertUnknownCopyFlag(diagnostics[0], "x", 2, 5, 2, 8);

                // no equals sign
                diagnostics = validateDockerfile("FROM alpine\nFROM busybox AS bb\nCOPY --x . .");
                assert.equal(diagnostics.length, 1);
                assertUnknownCopyFlag(diagnostics[0], "x", 2, 5, 2, 8);

                // flags are case-sensitive
                diagnostics = validateDockerfile("FROM alpine\nFROM busybox AS bb\nCOPY --FROM=bb . .");
                assert.equal(diagnostics.length, 1);
                assertUnknownCopyFlag(diagnostics[0], "FROM", 2, 5, 2, 11);

                diagnostics = validateDockerfile("FROM alpine\nFROM busybox AS bb\nCOPY --CHOWN=bb . .");
                assert.equal(diagnostics.length, 1);
                assertUnknownCopyFlag(diagnostics[0], "CHOWN", 2, 5, 2, 12);
            });
        });

        createSingleQuotedJSONTests("COPY");
    });

    function createMultipleNameValuePairTests(instruction: string) {
        let instructionLength = instruction.length;

        it("ok", function() {
            let diagnostics = validateDockerfile("FROM node\n" + instruction + " a b");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " x=y \\\n# abc \na=b");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " x=y \\\n# abc \r\na=b");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " var=value \\\n# comment\n# comment\nvar2=value2");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " var=value var2='value2' var3=\"value3\"");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " 'var'=value 'var2'='value2' 'var3'=\"value3\"");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " \"var\"=value \"var2\"='value2' \"var3\"=\"value3\"");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " var=value \\\n var2='value2' \\\n var3=\"value3\"");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " 'var'=value \\\n 'var2'='value2' \\\n 'var3'=\"value3\"");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " \"var\"=value \\\n \"var2\"='value2' \\\n \"var3\"=\"value3\"");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " a=b\\\n \"c\"=\"d\"");
            assert.equal(diagnostics.length, 0);
        });

        it("requires two", function() {
            let diagnostics = validateDockerfile("FROM node\n" + instruction + " a");
            assert.equal(diagnostics.length, 1);
            assertENVRequiresTwoArguments(diagnostics[0], 1, instructionLength + 1, 1, instructionLength + 2);
        });

        it("syntax missing equals", function() {
            let diagnostics = validateDockerfile("FROM node\n" + instruction + " a=b c");
            assert.equal(diagnostics.length, 1);
            assertSyntaxMissingEquals(diagnostics[0], "c", 1, instructionLength + 5, 1, instructionLength + 6);
            
            diagnostics = validateDockerfile("FROM node\n" + instruction + " a=b c d=e");
            assert.equal(diagnostics.length, 1);
            assertSyntaxMissingEquals(diagnostics[0], "c", 1, instructionLength + 5, 1, instructionLength + 6);
        });

        it("missing name", function() {
            let diagnostics = validateDockerfile("FROM node\n" + instruction + " x=y =z a=b");
            assert.equal(diagnostics.length, 1);
            assertSyntaxMissingNames(diagnostics[0], instruction, 1, instructionLength + 5, 1, instructionLength + 7);

            diagnostics = validateDockerfile("FROM node\n" + instruction + " x=y = a=b");
            assert.equal(diagnostics.length, 1);
            assertSyntaxMissingNames(diagnostics[0], instruction, 1, instructionLength + 5, 1, instructionLength + 6);
        });
    }

    describe("ENV", function() {
        describe("single", function() {
            createSingleNameValuePairTests("ENV");
        });

        describe("multiple", function() {
            createMultipleNameValuePairTests("ENV");
        });
    });

    describe("ENTRYPOINT", function() {
        createSingleQuotedJSONTests("ENTRYPOINT");
    });

    describe("EXPOSE", function() {
        describe("standard", function() {
            it("ok", function() {
                testValidArgument("EXPOSE", "8080");
                testValidArgument("EXPOSE", "80\\80");
                testValidArgument("EXPOSE", "7000-8000");
                testValidArgument("EXPOSE", "8080/tcp");
                testValidArgument("EXPOSE", "8080/TcP");
                testValidArgument("EXPOSE", "8080/udp");
                testValidArgument("EXPOSE", "8080/uDp");
                testValidArgument("EXPOSE", "8080/sctp");
                testValidArgument("EXPOSE", "8080/sCTp");
                testValidArgument("EXPOSE", "8080:8080");
                testValidArgument("EXPOSE", "8080:8080/tcp");
                // unspecified protocol is assumed to be TCP
                testValidArgument("EXPOSE", "8080/");
                // Docker engine does not flag such arguments as errors
                testValidArgument("EXPOSE", "8080/tcp/tcpx/tcptx/sdfsdfasdf/asdf/asdf/adf");
                testValidArgument("EXPOSE", "8080:888/tcp/123");
            });

            it("escape", function() {
                let diagnostics = validateDockerfile("FROM node\nEXPOSE 8080\\\n8081");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 8080\\\r\n8081");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 8080 \\\n8081");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nEXPOSE \\\n8080");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nEXPOSE \\\n 8080");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nEXPOSE \\\n8080\n");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nEXPOSE \\\n 8080\n");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nEXPOSE \\\n8080 \n");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nEXPOSE \\\n 8080 \n");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 8080\\\n");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 80\\\n80");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 8000-\\\n9000");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 8000\\\n-9000");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 80\\\r\n80");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 8000-\\\r\n9000");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 8000\\\r\n-9000");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nEXPOSE \\ 8000");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 8000\\ 8001");
                assert.equal(diagnostics.length, 0);
            });

            it("invalid containerPort", function() {
                let diagnostics = validateDockerfile("FROM node\nEXPOSE a");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "a", 1, 7, 1, 8);

                diagnostics = validateDockerfile("FROM node\nEXPOSE a ");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "a", 1, 7, 1, 8);

                diagnostics = validateDockerfile("FROM node\nEXPOSE a\n");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "a", 1, 7, 1, 8);

                diagnostics = validateDockerfile("FROM node\nEXPOSE a\r\n");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "a", 1, 7, 1, 8);

                diagnostics = validateDockerfile("FROM node\nEXPOSE a\\\n ");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "a", 1, 7, 1, 8);

                diagnostics = validateDockerfile("FROM node\nEXPOSE ab\\\n ");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "ab", 1, 7, 1, 9);

                diagnostics = validateDockerfile("FROM node\nEXPOSE a\r\n");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "a", 1, 7, 1, 8);

                diagnostics = validateDockerfile("FROM node\nEXPOSE a\\\r\n ");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "a", 1, 7, 1, 8);

                diagnostics = validateDockerfile("FROM node\nEXPOSE ab\\\r\n ");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "ab", 1, 7, 1, 9);

                diagnostics = validateDockerfile("FROM node\nEXPOSE -8000");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "-8000", 1, 7, 1, 12);

                diagnostics = validateDockerfile("FROM node\nEXPOSE -8000 ");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "-8000", 1, 7, 1, 12);

                diagnostics = validateDockerfile("FROM node\nEXPOSE -8000\n");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "-8000", 1, 7, 1, 12);

                diagnostics = validateDockerfile("FROM node\nEXPOSE -8000\n ");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "-8000", 1, 7, 1, 12);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 8000-");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "8000-", 1, 7, 1, 12);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 8000- ");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "8000-", 1, 7, 1, 12);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 8000-\n");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "8000-", 1, 7, 1, 12);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 8000-\n ");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "8000-", 1, 7, 1, 12);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 80\\\n00-\n");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "8000-", 1, 7, 2, 3);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 80\\\n00-");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "8000-", 1, 7, 2, 3);

                diagnostics = validateDockerfile("FROM node\nEXPOSE -");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "-", 1, 7, 1, 8);

                diagnostics = validateDockerfile("FROM node\nEXPOSE \\a");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "a", 1, 7, 1, 9);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 8080::8089");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "8080::8089", 1, 7, 1, 17);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 8080--8089");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "8080--8089", 1, 7, 1, 17);
            });

            it("invalid proto", function() {
                let diagnostics = validateDockerfile("FROM node\nEXPOSE 8080/tcpx");
                assert.equal(diagnostics.length, 1);
                assertInvalidProto(diagnostics[0], "tcpx", 1, 12, 1, 16);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 8080/TCPs");
                assert.equal(diagnostics.length, 1);
                assertInvalidProto(diagnostics[0], "TCPs", 1, 12, 1, 16);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 8080-8081:8082-8083/udpy");
                assert.equal(diagnostics.length, 1);
                assertInvalidProto(diagnostics[0], "udpy", 1, 27, 1, 31);

                diagnostics = validateDockerfile("FROM node\nEXPOSE 8080/x");
                assert.equal(diagnostics.length, 1);
                assertInvalidProto(diagnostics[0], "x", 1, 12, 1, 13);
            });	
        });

        describe("environment variables", function() {
            it("ok", function() {
                let diagnostics = validateDockerfile("FROM node\nARG PORT=8000\nEXPOSE $PORT");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nENV PORT=8000\nEXPOSE $PORT");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nARG PORT=8001\nENV PORT=8000\nEXPOSE $PORT");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nENV PORT=8001\nARG PORT=8000\nEXPOSE $PORT");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nEXPOSE $PORT");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nARG PORT\nEXPOSE $PORT");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nARG PORT\nEXPOSE $PORT-8010");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nARG ARG_VAR=1234\nEXPOSE \"$ARG_VAR\"");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM scratch\nARG ARG_VAR=1234\nENV ENV_VAR $ARG_VAR\nEXPOSE \"$ENV_VAR\"");
                assert.equal(diagnostics.length, 0);
            });

            it("invalid containerPort", function() {
                let diagnostics = validateDockerfile("FROM node\nARG PORT=a\nEXPOSE $PORT");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "a", 2, 7, 2, 12);

                diagnostics = validateDockerfile("FROM node\nENV PORT=a\nEXPOSE $PORT");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "a", 2, 7, 2, 12);

                diagnostics = validateDockerfile("FROM node\nARG PORT=b\nENV PORT=a\nEXPOSE $PORT");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "a", 3, 7, 3, 12);

                diagnostics = validateDockerfile("FROM node\nENV PORT=a\nARG PORT=b\nEXPOSE $PORT");
                assert.equal(diagnostics.length, 1);
                assertInvalidPort(diagnostics[0], "a", 3, 7, 3, 12);
            });
        });
    });

    describe("FROM", function() {
        describe("source image", function() {
            it("ok", function() {
                let diagnostics = validateDockerfile("FROM node");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node:8");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node@sha256:613685c22f65d01f2264bdd49b8a336488e14faf29f3ff9b6bf76a4da23c4700");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM repository.mycompany:5000/tomcat:8.0");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM my.private.repo.com:5000/some-image:latest");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM privateregistry.com/image:tag");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM privateregistry.com/image@sha256:613685c22f65d01f2264bdd49b8a336488e14faf29f3ff9b6bf76a4da23c4700");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM privateregistry.com:5000/image:tag");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM privateregistry.com:5000/image@sha256:613685c22f65d01f2264bdd49b8a336488e14faf29f3ff9b6bf76a4da23c4700");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM localhost/node:9");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM localhost/node@sha256:613685c22f65d01f2264bdd49b8a336488e14faf29f3ff9b6bf76a4da23c4700");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM localhost:1234/node:9");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM localhost:1234/node@sha256:613685c22f65d01f2264bdd49b8a336488e14faf29f3ff9b6bf76a4da23c4700");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM 123.22.33.123/user/image:tag2");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM 123.22.33.123/user/image@sha256:613685c22f65d01f2264bdd49b8a336488e14faf29f3ff9b6bf76a4da23c4700");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM 123.22.33.123:2345/user/image:tag2");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM 123.22.33.123:2345/user/image@sha256:613685c22f65d01f2264bdd49b8a336488e14faf29f3ff9b6bf76a4da23c4700");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("ARG image=node\nFROM $image");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("ARG REPO=mcr.microsoft.com/dotnet/framework/runtime\nFROM $REPO:4.8-windowsservercore-ltsc2016");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("ARG version\nFROM alpine:$version");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("ARG version\nFROM alpine@$version");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("ARG version=latest\nFROM alpine:$version");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("ARG version=atest\nFROM alpine:l$version");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("ARG atest=atest\nFROM alpine:l$atest");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("ARG DIGEST=sha256:7df6db5aa61ae9480f52f0b3a06a140ab98d427f86d8d5de0bedab9b8df6b1c0\nFROM alpine@$DIGEST");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("ARG image=scratch\nFROM ${image:-alpine}");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("ARG image=latest\nFROM alpine:${latest:-latest}");
                assert.equal(diagnostics.length, 0);
            });

            it("invalid reference format (tag)", function() {
                let diagnostics = validateDockerfile("FROM alpine:");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 5, 0, 12);

                diagnostics = validateDockerfile("FROM alpine:^");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 12, 0, 13);

                diagnostics = validateDockerfile("FROM alpine:.");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 12, 0, 13);

                diagnostics = validateDockerfile("FROM alpine:-");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 12, 0, 13);

                diagnostics = validateDockerfile("FROM alpine:a66^");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 12, 0, 16);

                // tags may contain a maximum of 128 characters
                diagnostics = validateDockerfile("FROM alpine:123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 12, 0, 141);
            });

            it("invalid reference format (digest)", function() {
                let diagnostics = validateDockerfile("FROM alpine@");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 5, 0, 12);

                diagnostics = validateDockerfile("FROM privateregistry.com/image@");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 5, 0, 31);

                diagnostics = validateDockerfile("FROM privateregistry.com:5000/image@");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 5, 0, 36);

                diagnostics = validateDockerfile("FROM localhost/node@");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 5, 0, 20);

                diagnostics = validateDockerfile("FROM localhost:1234/node@");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 5, 0, 25);

                diagnostics = validateDockerfile("FROM 123.22.33.123/user/image@");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 5, 0, 30);

                diagnostics = validateDockerfile("FROM 123.22.33.123:2345/user/image@");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 5, 0, 35);

                diagnostics = validateDockerfile("FROM alpine@sha25");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 12, 0, 17);

                diagnostics = validateDockerfile("FROM privateregistry.com/image@sha25");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 31, 0, 36);

                diagnostics = validateDockerfile("FROM privateregistry.com:5000/image@sha25");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 36, 0, 41);

                diagnostics = validateDockerfile("FROM localhost/node@sha25");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 20, 0, 25);

                diagnostics = validateDockerfile("FROM localhost:1234/node@sha25");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 25, 0, 30);

                diagnostics = validateDockerfile("FROM 123.22.33.123/user/image@sha25");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 30, 0, 35);

                diagnostics = validateDockerfile("FROM 123.22.33.123:2345/user/image@sha25");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 35, 0, 40);

                diagnostics = validateDockerfile("FROM alpine@sha25:x");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 12, 0, 19);

                diagnostics = validateDockerfile("FROM privateregistry.com/image@sha25:x");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 31, 0, 38);

                diagnostics = validateDockerfile("FROM privateregistry.com:5000/image@sha25:x");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 36, 0, 43);

                diagnostics = validateDockerfile("FROM localhost/node@sha25:x");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 20, 0, 27);

                diagnostics = validateDockerfile("FROM localhost:1234/node@sha25:x");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 25, 0, 32);

                diagnostics = validateDockerfile("FROM 123.22.33.123/user/image@sha25:x");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 30, 0, 37);

                diagnostics = validateDockerfile("FROM 123.22.33.123:2345/user/image@sha25:x");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 35, 0, 42);

                diagnostics = validateDockerfile("FROM alpine@x");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 12, 0, 13);

                diagnostics = validateDockerfile("FROM privateregistry.com/image@x");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 31, 0, 32);

                diagnostics = validateDockerfile("FROM privateregistry.com:5000/image@x");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 36, 0, 37);

                diagnostics = validateDockerfile("FROM localhost/node@x");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 20, 0, 21);

                diagnostics = validateDockerfile("FROM localhost:1234/node@x");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 25, 0, 26);

                diagnostics = validateDockerfile("FROM 123.22.33.123/user/image@x");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 30, 0, 31);

                diagnostics = validateDockerfile("FROM 123.22.33.123:2345/user/image@x");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 35, 0, 36);

                diagnostics = validateDockerfile("FROM alpine@x:2341");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 12, 0, 18);

                diagnostics = validateDockerfile("FROM privateregistry.com/image@x:2341");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 31, 0, 37);

                diagnostics = validateDockerfile("FROM privateregistry.com:5000/image@x:2341");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 36, 0, 42);

                diagnostics = validateDockerfile("FROM localhost/node@x:2341");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 20, 0, 26);

                diagnostics = validateDockerfile("FROM localhost:1234/node@x:2341");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 25, 0, 31);

                diagnostics = validateDockerfile("FROM 123.22.33.123/user/image@x:2341");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 30, 0, 36);

                diagnostics = validateDockerfile("FROM 123.22.33.123:2345/user/image@x:2341");
                assert.equal(diagnostics.length, 1);
                assertInvalidReferenceFormat(diagnostics[0], 0, 35, 0, 41);
            });

            it("empty base name", function() {
                let diagnostics = validateDockerfile("FROM $image");
                assert.equal(diagnostics.length, 1);
                assertBaseNameEmpty(diagnostics[0], "$image", 0, 5, 0, 11);
            });
        });

        describe("build stage", function() {
            it("ok", function() {
                let diagnostics = validateDockerfile("FROM node AS setup");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node As setup");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node aS setup");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node as setup");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node AS \\ \n setup");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node AS a_lpi-n.e99");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine \\\n# comment\n\n# comment\nAS build");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine \\\r\n# comment\r\n\r\n# comment\r\nAS build");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine \\\n# comment\\\nAS build");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine \\\r\n# comment\\\r\nAS build");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine AS \\\n# comment\\\nbuild");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM alpine AS \\\r\n# comment\\\r\nbuild");
                assert.equal(diagnostics.length, 0);
            });

            it("invalid as", function() {
                let diagnostics = validateDockerfile("FROM node A$ setup");
                assert.equal(diagnostics.length, 1);
                assertInvalidAs(diagnostics[0], 0, 10, 0, 12);
            });

            it("duplicate name", function() {
                let diagnostics = validateDockerfile("FROM node AS setup\nFROM node AS setup");
                assert.equal(diagnostics.length, 2);
                assertDuplicateBuildStageName(diagnostics[0], "setup", 0, 13, 0, 18);
                assertDuplicateBuildStageName(diagnostics[1], "setup", 1, 13, 1, 18);

                diagnostics = validateDockerfile("FROM node AS setup\nFROM node AS setUP");
                assert.equal(diagnostics.length, 2);
                assertDuplicateBuildStageName(diagnostics[0], "setup", 0, 13, 0, 18);
                assertDuplicateBuildStageName(diagnostics[1], "setup", 1, 13, 1, 18);

                diagnostics = validateDockerfile("FROM node AS SETUP\nFROM node AS seTUp");
                assert.equal(diagnostics.length, 2);
                assertDuplicateBuildStageName(diagnostics[0], "setup", 0, 13, 0, 18);
                assertDuplicateBuildStageName(diagnostics[1], "setup", 1, 13, 1, 18);
            });

            it("invalid name", function() {
                let diagnostics = validateDockerfile("FROM node AS 1s");
                assert.equal(diagnostics.length, 1);
                assertInvalidBuildStageName(diagnostics[0], "1s", 0, 13, 0, 15);

                diagnostics = validateDockerfile("FROM node AS _s");
                assert.equal(diagnostics.length, 1);
                assertInvalidBuildStageName(diagnostics[0], "_s", 0, 13, 0, 15);

                diagnostics = validateDockerfile("FROM node AS a_lpi-n.e,99");
                assert.equal(diagnostics.length, 1);
                assertInvalidBuildStageName(diagnostics[0], "a_lpi-n.e,99", 0, 13, 0, 25);
            });

            it("empty base name", function() {
                let diagnostics = validateDockerfile("FROM $image AS stage");
                assert.equal(diagnostics.length, 1);
                assertBaseNameEmpty(diagnostics[0], "$image", 0, 5, 0, 11);
            });
        });

        describe("source image", function() {
            it("ok", function() {
                let diagnostics = validateDockerfile("FROM --platform=linux node");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM --platform= node");
                assert.equal(diagnostics.length, 0);
            });

            it("unknown flag", function() {
                let diagnostics = validateDockerfile("FROM --platfor=linux alpine");
                assert.equal(diagnostics.length, 1);
                assertUnknownFromFlag(diagnostics[0], "platfor", 0, 5, 0, 14);

                // case sensitive
                diagnostics = validateDockerfile("FROM --PLATFORM=linux alpine");
                assert.equal(diagnostics.length, 1);
                assertUnknownFromFlag(diagnostics[0], "PLATFORM", 0, 5, 0, 15);

                // empty name
                diagnostics = validateDockerfile("FROM -- alpine");
                assert.equal(diagnostics.length, 1);
                assertUnknownFromFlag(diagnostics[0], "", 0, 5, 0, 7);
            });

            it("flag missing value", function() {
                let diagnostics = validateDockerfile("FROM --platform alpine");
                assert.equal(diagnostics.length, 1);
                assertFlagMissingValue(diagnostics[0], "platform", 0, 7, 0, 15);
            });
        });

        describe("wrong args number", function() {
            it("two", function() {
                let diagnostics = validateDockerfile("FROM node AS");
                assert.equal(diagnostics.length, 1);
                assertInstructionRequiresOneOrThreeArguments(diagnostics[0], 0, 10, 0, 12);

                diagnostics = validateDockerfile("FROM node As \\\n");
                assert.equal(diagnostics.length, 1);
                assertInstructionRequiresOneOrThreeArguments(diagnostics[0], 0, 10, 0, 12);

                diagnostics = validateDockerfile("FROM node test");
                assert.equal(diagnostics.length, 1);
                assertInstructionRequiresOneOrThreeArguments(diagnostics[0], 0, 10, 0, 14);

                diagnostics = validateDockerfile("from node test");
                assertDiagnostics(diagnostics,
                    [ ValidationCode.CASING_INSTRUCTION, ValidationCode.ARGUMENT_REQUIRES_ONE_OR_THREE ],
                    [ assertInstructionCasing, assertInstructionRequiresOneOrThreeArguments ],
                    [ [ DiagnosticSeverity.Warning, 0, 0, 0, 4 ], [ 0, 10, 0, 14 ] ]);
            });

            it("four", function() {
                let diagnostics = validateDockerfile("FROM node AS setup again");
                assert.equal(diagnostics.length, 1);
                assertInstructionRequiresOneOrThreeArguments(diagnostics[0], 0, 19, 0, 24);

                diagnostics = validateDockerfile("FROM node As \\\nsetup two");
                assert.equal(diagnostics.length, 1);
                assertInstructionRequiresOneOrThreeArguments(diagnostics[0], 1, 6, 1, 9);
            });
        });
    });

    describe("HEALTHCHECK", function() {
        describe("CMD", function() {
            describe("flags", function() {
                it("ok", function() {
                    let diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --interval=30s --retries=3 --start-period=5s --timeout=30s CMD ls");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --interval=30s CMD ls");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --retries=3 CMD ls");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --start-period=5s CMD ls");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --timeout=30s CMD ls");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --interval=1ms01h1m1s1ms CMD ls");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --timeout=.5s CMD ls");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --timeout=5s.1ms CMD ls");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --timeout=5.5s10.0ms CMD ls");
                    assert.equal(diagnostics.length, 0);
                });

                it("unknown flag", function() {
                    let diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --interva=30s CMD ls");
                    assert.equal(diagnostics.length, 1);
                    assertUnknownHealthcheckFlag(diagnostics[0], "interva", 1, 12, 1, 21);

                    // empty name
                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK -- CMD ls");
                    assert.equal(diagnostics.length, 1);
                    assertUnknownHealthcheckFlag(diagnostics[0], "", 1, 12, 1, 14);

                    // empty value
                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --interva= CMD ls");
                    assert.equal(diagnostics.length, 1);
                    assertUnknownHealthcheckFlag(diagnostics[0], "interva", 1, 12, 1, 21);

                    // no equals sign
                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --interva CMD ls");
                    assert.equal(diagnostics.length, 1);
                    assertUnknownHealthcheckFlag(diagnostics[0], "interva", 1, 12, 1, 21);

                    // flags are case-sensitive
                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --INTERVAL=30s CMD ls");
                    assert.equal(diagnostics.length, 1);
                    assertUnknownHealthcheckFlag(diagnostics[0], "INTERVAL", 1, 12, 1, 22);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --RETRIES=3 CMD ls");
                    assert.equal(diagnostics.length, 1);
                    assertUnknownHealthcheckFlag(diagnostics[0], "RETRIES", 1, 12, 1, 21);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --START-PERIOD=0s CMD ls");
                    assert.equal(diagnostics.length, 1);
                    assertUnknownHealthcheckFlag(diagnostics[0], "START-PERIOD", 1, 12, 1, 26);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --TIMEOUT=30s CMD ls");
                    assert.equal(diagnostics.length, 1);
                    assertUnknownHealthcheckFlag(diagnostics[0], "TIMEOUT", 1, 12, 1, 21);
                });

                it("flag no value", function() {
                    let diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --interval CMD ls");
                    assert.equal(diagnostics.length, 1);
                    assertFlagMissingValue(diagnostics[0], "interval", 1, 14, 1, 22);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --retries CMD ls");
                    assert.equal(diagnostics.length, 1);
                    assertFlagMissingValue(diagnostics[0], "retries", 1, 14, 1, 21);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --start-period CMD ls");
                    assert.equal(diagnostics.length, 1);
                    assertFlagMissingValue(diagnostics[0], "start-period", 1, 14, 1, 26);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --timeout CMD ls");
                    assert.equal(diagnostics.length, 1);
                    assertFlagMissingValue(diagnostics[0], "timeout", 1, 14, 1, 21);
                });

                it("flags empty value", function() {
                    let diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --interval= --retries= --start-period= --timeout= CMD ls");
                    assert.equal(diagnostics.length, 0);
                });

                it("duplicate flag", function() {
                    let diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --interval=30s --interval=30s CMD ls");
                    assert.equal(diagnostics.length, 2);
                    assertFlagDuplicate(diagnostics[0], "interval", 1, 14, 1, 22);
                    assertFlagDuplicate(diagnostics[1], "interval", 1, 29, 1, 37);
                });

                it("--retries", function() {
                    let diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --retries=3 CMD ls");
                    assert.equal(diagnostics.length, 0);

                    // leading zeroes
                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --retries=001 CMD ls");
                    assert.equal(diagnostics.length, 0);
                });

                it("invalid --retries value", function() {
                    let diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --retries=a CMD ls");
                    assert.equal(diagnostics.length, 1);
                    assertInvalidSyntax(diagnostics[0], "a", 1, 22, 1, 23);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --retries=1.0 CMD ls");
                    assert.equal(diagnostics.length, 1);
                    assertInvalidSyntax(diagnostics[0], "1.0", 1, 22, 1, 25);
                });

                it("--retries at least one", function() {
                    let diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --retries=0 CMD ls");
                    assert.equal(diagnostics.length, 1);
                    assertFlagAtLeastOne(diagnostics[0], "--retries", "0", 1, 22, 1, 23);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --retries=-1 CMD ls");
                    assert.equal(diagnostics.length, 1);
                    assertFlagAtLeastOne(diagnostics[0], "--retries", "-1", 1, 22, 1, 24);
                });

                it("CMD no arguments", function() {
                    let diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK CMD");
                    assert.equal(diagnostics.length, 1);
                    assertHealthcheckCmdArgumentMissing(diagnostics[0], 1, 12, 1, 15);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK CMD ");
                    assert.equal(diagnostics.length, 1);
                    assertHealthcheckCmdArgumentMissing(diagnostics[0], 1, 12, 1, 15);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK CMD \n");
                    assert.equal(diagnostics.length, 1);
                    assertHealthcheckCmdArgumentMissing(diagnostics[0], 1, 12, 1, 15);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK CMD CMD");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK CMD cmd");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK cmd CMD");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK cmd cmd");
                    assert.equal(diagnostics.length, 0);
                });

                function createInvalidDurationTests(flag: string) {
                    it(flag, function() {
                        let length = flag.length;
                        let diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=a CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagInvalidDuration(diagnostics[0], "a", 1, 15 + length, 1, 15 + length + 1);
                        
                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=a1s CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagInvalidDuration(diagnostics[0], "a1s", 1, 15 + length, 1, 15 + length + 3);
    
                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=--5s CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagInvalidDuration(diagnostics[0], "--5s", 1, 15 + length, 1, 15 + length + 4);
                    });
                }

                describe("invalid duration", function() {
                    createInvalidDurationTests("interval");
                    createInvalidDurationTests("start-period");
                    createInvalidDurationTests("timeout");
                });

                function createMissingDurationTests(flag: string) {
                    it(flag, function() {
                        let length = flag.length;
                        let diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=10 CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagMissingDuration(diagnostics[0], "10", 1, 15 + length, 1, 15 + length + 2);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=-10 CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagMissingDuration(diagnostics[0], "-10", 1, 15 + length, 1, 15 + length + 3);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=5s5 CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagMissingDuration(diagnostics[0], "5s5", 1, 15 + length, 1, 15 + length + 3);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=5..5s CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagMissingDuration(diagnostics[0], "5..5s", 1, 15 + length, 1, 15 + length + 5);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=5.5.5s CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagMissingDuration(diagnostics[0], "5.5.5s", 1, 15 + length, 1, 15 + length + 6);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=5.5s10..0ms CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagMissingDuration(diagnostics[0], "5.5s10..0ms", 1, 15 + length, 1, 15 + length + 11);
                    });
                }

                describe("missing duration", function() {
                    createMissingDurationTests("interval");
                    createMissingDurationTests("start-period");
                    createMissingDurationTests("timeout");
                });

                function createDurationUnknownUnitTests(flag: string) {
                    it(flag, function() {
                        let length = flag.length;
                        let diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=1x CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagUnknownUnit(diagnostics[0], "x", "1x", 1, 15 + length, 1, 15 + length + 2);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=1s1x CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagUnknownUnit(diagnostics[0], "x", "1s1x", 1, 15 + length, 1, 15 + length + 4);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=1x1s CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagUnknownUnit(diagnostics[0], "x", "1x1s", 1, 15 + length, 1, 15 + length + 4);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=5s-10ms CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagUnknownUnit(diagnostics[0], "s-", "5s-10ms", 1, 15 + length, 1, 15 + length + 7);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=5-5s CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagUnknownUnit(diagnostics[0], "-", "5-5s", 1, 15 + length, 1, 15 + length + 4);
                    });
                }

                describe("unknown unit", function() {
                    createDurationUnknownUnitTests("interval");
                    createDurationUnknownUnitTests("start-period");
                    createDurationUnknownUnitTests("timeout");
                });

                function createDurationTooShortTests(flag: string) {
                    it(flag, function() {
                        let diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=900ms CMD ls");
                        assert.equal(diagnostics.length, 0);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=1s CMD ls");
                        assert.equal(diagnostics.length, 0);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=1m CMD ls");
                        assert.equal(diagnostics.length, 0);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=1h CMD ls");
                        assert.equal(diagnostics.length, 0);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=500us600us CMD ls");
                        assert.equal(diagnostics.length, 0);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=500ns600s CMD ls");
                        assert.equal(diagnostics.length, 0);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=0s10s CMD ls");
                        assert.equal(diagnostics.length, 0);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=0s CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagLessThan1ms(diagnostics[0], flag, 1, 14, 1, 14 + flag.length);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=-1s CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagLessThan1ms(diagnostics[0], flag, 1, 14, 1, 14 + flag.length);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=100us CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagLessThan1ms(diagnostics[0], flag, 1, 14, 1, 14 + flag.length);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=100µs CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagLessThan1ms(diagnostics[0], flag, 1, 14, 1, 14 + flag.length);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=100ns CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagLessThan1ms(diagnostics[0], flag, 1, 14, 1, 14 + flag.length);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=-500ns600s CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagLessThan1ms(diagnostics[0], flag, 1, 14, 1, 14 + flag.length);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=-0s CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagLessThan1ms(diagnostics[0], flag, 1, 14, 1, 14 + flag.length);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=-0s10s CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagLessThan1ms(diagnostics[0], flag, 1, 14, 1, 14 + flag.length);

                        diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --" + flag + "=.1ms CMD ls");
                        assert.equal(diagnostics.length, 1);
                        assertFlagLessThan1ms(diagnostics[0], flag, 1, 14, 1, 14 + flag.length);
                    });
                }

                describe("too short", function() {
                    createDurationTooShortTests("interval");
                    createDurationTooShortTests("start-period");
                    createDurationTooShortTests("timeout");
                });
            });
        });

        describe("NONE", function() {
            describe("flags", function() {
                it("ok", function() {
                    // flags don't make sense for a NONE,
                    // but the builder ignores them so we should too
                    let diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --interval=30s --retries=3 --start-period=0s --timeout=30s NONE");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --interval=30s NONE");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --retries=3 NONE");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --start-period=0s NONE");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --timeout=30s NONE");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --timeout=20s --timeout=30s NONE");
                    assert.equal(diagnostics.length, 0);
                });

                it("arguments specified", function() {
                    // single argument
                    let diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK NONE --interval=10s");
                    assert.equal(diagnostics.length, 1);
                    assertInstructionUnnecessaryArgument(diagnostics[0], 1, 17, 1, 31);

                    // multiple arguments
                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK NONE a b c");
                    assert.equal(diagnostics.length, 1);
                    assertInstructionUnnecessaryArgument(diagnostics[0], 1, 17, 1, 22);
                });
            });
        });

        describe("unknown type", function() {
            it("argument only", function() {
                let diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK TEST");
                assert.equal(diagnostics.length, 1);
                assertHealthcheckTypeUnknown(diagnostics[0], "TEST", 1, 12, 1, 16);

                diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK test");
                assert.equal(diagnostics.length, 1);
                assertHealthcheckTypeUnknown(diagnostics[0], "TEST", 1, 12, 1, 16);
            });

            it("flags", function() {
                let diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --interval=10s TEST");
                assert.equal(diagnostics.length, 1);
                assertHealthcheckTypeUnknown(diagnostics[0], "TEST", 1, 27, 1, 31);

                diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --interval=10s test");
                assert.equal(diagnostics.length, 1);
                assertHealthcheckTypeUnknown(diagnostics[0], "TEST", 1, 27, 1, 31);
            });

            it("invalid flags", function() {
                let diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --intervul=10s TEST");
                assert.equal(diagnostics.length, 2);
                assertDiagnostics(
                    diagnostics,
                    [ ValidationCode.UNKNOWN_HEALTHCHECK_FLAG, ValidationCode.UNKNOWN_TYPE ],
                    [ assertUnknownHealthcheckFlag, assertHealthcheckTypeUnknown ],
                    [ [ "intervul", 1, 12, 1, 22 ], [ "TEST", 1, 27, 1, 31 ]]);
            });
        });

        describe("unspecified", function() {
            describe("flags", function() {
                it("wrong name", function() {
                    // no equals sign
                    let diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --interva");
                    assert.equal(diagnostics.length, 2);
                    assertDiagnostics(
                        diagnostics,
                        [ ValidationCode.UNKNOWN_HEALTHCHECK_FLAG, ValidationCode.ARGUMENT_REQUIRES_AT_LEAST_ONE ],
                        [ assertUnknownHealthcheckFlag, assertHEALTHCHECKRequiresAtLeastOneArgument ],
                        [ [ "interva", 1, 12, 1, 21 ], [ 1, 0, 1, 11 ]]);

                    // empty value
                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --interva=");
                    assert.equal(diagnostics.length, 2);
                    assertDiagnostics(
                        diagnostics,
                        [ ValidationCode.UNKNOWN_HEALTHCHECK_FLAG, ValidationCode.ARGUMENT_REQUIRES_AT_LEAST_ONE ],
                        [ assertUnknownHealthcheckFlag, assertHEALTHCHECKRequiresAtLeastOneArgument ],
                        [ [ "interva", 1, 12, 1, 21 ], [ 1, 0, 1, 11 ]]);

                    // value specified
                    diagnostics = validateDockerfile("FROM alpine\nHEALTHCHECK --interva=30s");
                    assert.equal(diagnostics.length, 2);
                    assertDiagnostics(
                        diagnostics,
                        [ ValidationCode.UNKNOWN_HEALTHCHECK_FLAG, ValidationCode.ARGUMENT_REQUIRES_AT_LEAST_ONE ],
                        [ assertUnknownHealthcheckFlag, assertHEALTHCHECKRequiresAtLeastOneArgument ],
                        [ [ "interva", 1, 12, 1, 21 ], [ 1, 0, 1, 11 ]]);
                });
            });
        });
    });


    describe("LABEL", function() {
        describe("single", function() {
            createSingleNameValuePairTests("LABEL");
        });

        describe("multiple", function() {
            createMultipleNameValuePairTests("LABEL");
        });
    });

    function createMaintainerTests(trigger: boolean) {
        let onbuild = trigger ? "ONBUILD " : "";
        let onbuildOffset = onbuild.length;

        describe("MAINTAINER", function() {
            it("default", function() {
                let validator = new Validator();
                let diagnostics = validator.validate(createDocument("FROM node\n" + onbuild + "MAINTAINER author"));
                if (onbuild) {
                    assert.equal(diagnostics.length, 2);
                    assertDiagnostics(diagnostics,
                        [ ValidationCode.ONBUILD_TRIGGER_DISALLOWED, ValidationCode.DEPRECATED_MAINTAINER ],
                        [ assertOnbuildTriggerDisallowed, assertDeprecatedMaintainer ],
                        [ [ "MAINTAINER", 1, onbuildOffset, 1, onbuildOffset + 10 ],
                            [ DiagnosticSeverity.Warning, 1, onbuildOffset, 1, onbuildOffset + 10 ] ]);
                } else {
                    assert.equal(diagnostics.length, 1);
                    assertDeprecatedMaintainer(diagnostics[0], DiagnosticSeverity.Warning, 1, onbuildOffset, 1, onbuildOffset + 10);
                }
            });

            it("ignore", function() {
                let diagnostics = validateDockerfile("FROM node\n" + onbuild + "MAINTAINER author", { deprecatedMaintainer: ValidationSeverity.IGNORE });
                if (onbuild) {
                    assert.equal(diagnostics.length, 1);
                    assertOnbuildTriggerDisallowed(diagnostics[0], "MAINTAINER", 1, onbuildOffset, 1, onbuildOffset + 10);
                } else {
                    assert.equal(diagnostics.length, 0);
                }
            });

            it("warning", function() {
                let diagnostics = validateDockerfile("FROM node\n" + onbuild + "MAINTAINER author", { deprecatedMaintainer: ValidationSeverity.WARNING });
                if (onbuild) {
                    assert.equal(diagnostics.length, 2);
                    assertDiagnostics(diagnostics,
                        [ ValidationCode.ONBUILD_TRIGGER_DISALLOWED, ValidationCode.DEPRECATED_MAINTAINER ],
                        [ assertOnbuildTriggerDisallowed, assertDeprecatedMaintainer ],
                        [ [ "MAINTAINER", 1, onbuildOffset, 1, onbuildOffset + 10 ],
                            [ DiagnosticSeverity.Warning, 1, onbuildOffset, 1, onbuildOffset + 10 ] ]);
                } else {
                    assert.equal(diagnostics.length, 1);
                    assertDeprecatedMaintainer(diagnostics[0], DiagnosticSeverity.Warning, 1, onbuildOffset, 1, onbuildOffset + 10);
                }
            });

            it("error", function() {
                let diagnostics = validateDockerfile("FROM node\n" + onbuild + "MAINTAINER author", { deprecatedMaintainer: ValidationSeverity.ERROR });
                if (onbuild) {
                    assert.equal(diagnostics.length, 2);
                    assertDiagnostics(diagnostics,
                        [ ValidationCode.ONBUILD_TRIGGER_DISALLOWED, ValidationCode.DEPRECATED_MAINTAINER ],
                        [ assertOnbuildTriggerDisallowed, assertDeprecatedMaintainer ],
                        [ [ "MAINTAINER", 1, onbuildOffset, 1, onbuildOffset + 10 ],
                            [ DiagnosticSeverity.Error, 1, onbuildOffset, 1, onbuildOffset + 10 ] ]);
                } else {
                    assert.equal(diagnostics.length, 1);
                    assertDeprecatedMaintainer(diagnostics[0], DiagnosticSeverity.Error, 1, onbuildOffset, 1, onbuildOffset + 10);
                }
            });
        });
    }

    createMaintainerTests(false);

    describe("ONBUILD", function() {
        createUppercaseStyleTest(true);
        createMaintainerTests(true);

        describe("invalid triggers", function() {
            it("ONBUILD FROM", function() {
                let diagnostics = validateDockerfile("FROM alpine\nONBUILD FROM alpine");
                assert.equal(diagnostics.length, 1);
                assertOnbuildTriggerDisallowed(diagnostics[0], "FROM", 1, 8, 1, 12);

                diagnostics = validateDockerfile("FROM alpine\nONBUILD from alpine", { instructionCasing: ValidationSeverity.IGNORE });
                assert.equal(diagnostics.length, 1);
                assertOnbuildTriggerDisallowed(diagnostics[0], "FROM", 1, 8, 1, 12);
            });

            it("ONBUILD MAINTAINER", function() {
                let diagnostics = validateDockerfile("FROM alpine\nONBUILD MAINTAINER user");
                assert.equal(diagnostics.length, 1);
                assertOnbuildTriggerDisallowed(diagnostics[0], "MAINTAINER", 1, 8, 1, 18);

                diagnostics = validateDockerfile("FROM alpine\nONBUILD maintainer user", { instructionCasing: ValidationSeverity.IGNORE });
                assert.equal(diagnostics.length, 1);
                assertOnbuildTriggerDisallowed(diagnostics[0], "MAINTAINER", 1, 8, 1, 18);
            });

            it("ONBUILD ONBUILD", function() {
                let diagnostics = validateDockerfile("FROM alpine\nONBUILD ONBUILD ENV x=y");
                assert.equal(diagnostics.length, 1);
                assertOnbuildChainingDisallowed(diagnostics[0], 1, 8, 1, 15);

                diagnostics = validateDockerfile("FROM alpine\nONBUILD onbuild ENV x=y", { instructionCasing: ValidationSeverity.IGNORE });
                assert.equal(diagnostics.length, 1);
                assertOnbuildChainingDisallowed(diagnostics[0], 1, 8, 1, 15);
            });
        });
    });

    describe("RUN", function() {
        it("empty newline escape", function() {
            let diagnostics = validateDockerfile("FROM busybox\nRUN ls && \\\n\nls");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\rRUN ls && \\\r\rls");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\r\nRUN ls && \\\r\n\r\nls");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\r\nRUN ls && \\\r\n");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\r\nRUN ls && \\\na");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\r\nRUN ls && \\\r\na");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\r\nRUN \\\n\"\\\n\\\n\"");
            assert.equal(diagnostics.length, 0);
        });

        it("whitespace newline escape", function() {
            let diagnostics = validateDockerfile("FROM busybox\nRUN ls && \\\n \t \nls");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\rRUN ls && \\\r \t \rls");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\r\nRUN ls && \\\r\n \t \r\nls");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\r\nRUN ls && \\\r\n \t ");
            assert.equal(diagnostics.length, 0);
        });

        it("comment escape", function() {
            let diagnostics = validateDockerfile("FROM busybox\nRUN ls && \\\n# comment\nls");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\r\nRUN ls && \\\r\n# comment\r\nls");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\r\nRUN ls && \\\r\n# comment");
            assert.equal(diagnostics.length, 0);
        });

        it("whitespace comment escape", function() {
            let diagnostics = validateDockerfile("FROM busybox\nRUN ls && \\\n \t# comment\nls");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\r\nRUN ls && \\\r\n \t# comment\r\nls");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\r\nRUN ls && \\\r\n \t# comment");
            assert.equal(diagnostics.length, 0);
        });

        it("flags only with no argument", function () {
            let diagnostics = validateDockerfile("FROM alpine\nRUN --x=y");
            assert.equal(diagnostics.length, 1);
            assertInstructionMissingArgument(diagnostics[0], 1, 0, 1, 3);

            diagnostics = validateDockerfile("FROM alpine\nRUN --x=y --abc=def");
            assert.equal(diagnostics.length, 1);
            assertInstructionMissingArgument(diagnostics[0], 1, 0, 1, 3);
        });

        createSingleQuotedJSONTests("RUN");
    });

    describe("SHELL", function() {
        it("ok", function() {
            let diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"/bin/sh\" ]");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"/bin/sh\", \"-c\" ]");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [\"a,b\"]");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"a,b\" ]");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"a\\b\" ]");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"/bin/sh\", \\\n \"-c\" ]");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"/bin/sh\", \\\r \"-c\" ]");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"/bin/sh\", \\\r\n \"-c\" ]");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"/bin/sh\", \\ \t\n \"-c\" ]");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"a\\\"\" ]");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"a\\\nb\" ]");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"a\\\n b\" ]");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"a\\\n  b\" ]");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"a\\\t \n  b\" ]");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"a\\ \t\r  b\" ]");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"a\\ \t\r\n  b\" ]");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"[\" ]");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"\\\\[\" ]");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"/bin/sh\" ] ]");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"/bin/sh\" ] [");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"/bin/sh\" ] ,");
            assert.equal(diagnostics.length, 0);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"/bin/sh\" ] a");
            assert.equal(diagnostics.length, 0);
        });

        it("invalid escape", function() {
            let diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"a\\ b\" ]");
            assert.equal(diagnostics.length, 1);
            assertShellJsonForm(diagnostics[0], 1, 6, 1, 16);
        });

        it("missing starting [", function() {
            let diagnostics = validateDockerfile("FROM busybox\nSHELL \"/bin/sh\" ]");
            assert.equal(diagnostics.length, 1);
            assertShellJsonForm(diagnostics[0], 1, 6, 1, 17);

            diagnostics = validate("FROM busybox\nSHELL \\a");
            assert.equal(diagnostics.length, 1);
            assertShellJsonForm(diagnostics[0], 1, 6, 1, 8);

            diagnostics = validate("FROM busybox\nSHELL a \\ a");
            assert.equal(diagnostics.length, 1);
            assertShellJsonForm(diagnostics[0], 1, 6, 1, 11);
        });

        it("double starting [", function() {
            let diagnostics = validateDockerfile("FROM busybox\nSHELL [ [ \"/bin/sh\" ]");
            assert.equal(diagnostics.length, 1);
            assertShellJsonForm(diagnostics[0], 1, 6, 1, 21);
        });

        it("missing starting \"", function() {
            let diagnostics = validateDockerfile("FROM busybox\nSHELL [ /bin/sh\" ]");
            assert.equal(diagnostics.length, 1);
            assertShellJsonForm(diagnostics[0], 1, 6, 1, 18);
        });

        it("missing ending \"", function() {
            let diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"/bin/sh ]");
            assert.equal(diagnostics.length, 1);
            assertShellJsonForm(diagnostics[0], 1, 6, 1, 18);
        });

        it("missing ending ]", function() {
            let diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"/bin/sh\"");
            assert.equal(diagnostics.length, 1);
            assertShellJsonForm(diagnostics[0], 1, 6, 1, 17);
        });

        it("comma with EOF", function() {
            let diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"/bin/sh\",");
            assert.equal(diagnostics.length, 1);
            assertShellJsonForm(diagnostics[0], 1, 6, 1, 18);
        });

        it("comma with EOL", function() {
            let diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"/bin/sh\",\n");
            assert.equal(diagnostics.length, 1);
            assertShellJsonForm(diagnostics[0], 1, 6, 1, 18);
        });

        it("comma without first argument", function() {
            let diagnostics = validateDockerfile("FROM busybox\nSHELL [ ,\"/bin/sh\" ]");
            assert.equal(diagnostics.length, 1);
            assertShellJsonForm(diagnostics[0], 1, 6, 1, 20);
        });

        it("comma without second argument", function() {
            let diagnostics = validateDockerfile("FROM busybox\nSHELL [ \"/bin/sh\", ]");
            assert.equal(diagnostics.length, 1);
            assertShellJsonForm(diagnostics[0], 1, 6, 1, 20);
        });

        it("backtick escape directive ignored", function() {
            let diagnostics = validateDockerfile("#escape=`\nFROM busybox\nSHELL [ \"a`\"\" ]");
            assert.equal(diagnostics.length, 1);
            assertShellJsonForm(diagnostics[0], 2, 6, 2, 15);
        });

        it("requires at least one argument", function() {
            let diagnostics = validateDockerfile("FROM busybox\nSHELL []");
            assert.equal(diagnostics.length, 1);
            assertShellRequiresOne(diagnostics[0], 1, 6, 1, 8);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ ]");
            assert.equal(diagnostics.length, 1);
            assertShellRequiresOne(diagnostics[0], 1, 6, 1, 9);

            diagnostics = validateDockerfile("FROM busybox\nSHELL [ \\\n ]");
            assert.equal(diagnostics.length, 1);
            assertShellRequiresOne(diagnostics[0], 1, 6, 2, 2);
        });
    });

    describe("STOPSIGNAL", function() {
        describe("standard", function() {
            it("ok", function() {
                testValidArgument("STOPSIGNAL", "9");
                testValidArgument("STOPSIGNAL", "SIGKILL");

            });

            it("escape", function() {
                let diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL \\\n9");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL \\\n 9");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL\\\n 9");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL \\\r\n9");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL\\\r\n 9");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL \\\r\n 9");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL 9\\\n");
                assert.equal(diagnostics.length, 0);

                testEscape("STOPSIGNAL", "SI", "GKILL");
                testEscape("STOPSIGNAL", "SIGK", "ILL");
            });

            it("invalid stop signal", function() {
                let diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL a");
                assert.equal(diagnostics.length, 1);
                assertInvalidStopSignal(diagnostics[0], "a", 1, 11, 1, 12);

                diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL a ");
                assert.equal(diagnostics.length, 1);
                assertInvalidStopSignal(diagnostics[0], "a", 1, 11, 1, 12);

                diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL a\n");
                assert.equal(diagnostics.length, 1);
                assertInvalidStopSignal(diagnostics[0], "a", 1, 11, 1, 12);

                diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL a\r");
                assert.equal(diagnostics.length, 1);
                assertInvalidStopSignal(diagnostics[0], "a", 1, 11, 1, 12);
            });
        });

        describe("environment variables", function() {
            it("ok", function() {
                let diagnostics = validateDockerfile("FROM busybox\nARG x\nSTOPSIGNAL $x");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM busybox\nARG x\nSTOPSIGNAL ${x}");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM busybox\nARG x\nSTOPSIGNAL s$x");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM busybox\nARG x\nSTOPSIGNAL s${x}");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM busybox\nENV x=SIGKILL\nSTOPSIGNAL $x");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM busybox\nENV x=SIGKILL\nSTOPSIGNAL ${x}");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM busybox\nENV x=IGKILL\nSTOPSIGNAL s$x");
                assert.equal(diagnostics.length, 0);

                diagnostics = validateDockerfile("FROM busybox\nENV x=IGKILL\nSTOPSIGNAL s${x}");
                assert.equal(diagnostics.length, 0);
            });

            it("invalid stop signal", function() {
                let diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL $");
                assert.equal(diagnostics.length, 1);
                assertInvalidStopSignal(diagnostics[0], "$", 1, 11, 1, 12);

                diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL $a");
                assert.equal(diagnostics.length, 1);
                assertInvalidStopSignal(diagnostics[0], "", 1, 11, 1, 13);

                diagnostics = validateDockerfile("FROM node\nSTOPSIGNAL ${a");
                assert.equal(diagnostics.length, 1);
                assertInvalidStopSignal(diagnostics[0], "${a", 1, 11, 1, 14);
            });
        });
    });

    describe("USER", function() {
        it("ok", function() {
            return testValidArgument("USER", "daemon");
        });

        it("escape", function() {
            return testEscape("USER", "dae", "mon");
        });
    });

    describe("VOLUME", function() {
        it("simple", function() {
            testValidArgument("VOLUME", "/var/log");
        });

        it("escape", function() {
            let diagnostics = validateDockerfile("FROM node\nVOLUME /var/log \\\n /tmp");
            assert.equal(diagnostics.length, 0);
        });

        createSingleQuotedJSONTests("VOLUME");
    });

    describe("WORKDIR", function() {
        it("ok", function() {
            testValidArgument("WORKDIR", "/orion");
        });

        function createAbsolutePathTests(testName: string, severity?: ValidationSeverity) {
            describe(testName, function() {
                it("ok", function() {
                    let diagnostics = validateDockerfile("FROM scratch\nWORKDIR /path/");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM scratch\nWORKDIR '/path/'");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM scratch\nWORKDIR \"/path/\"");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM scratch\nWORKDIR /path/path2");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM scratch\nWORKDIR '/path/path2'");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM scratch\nWORKDIR \"/path/path2\"");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM scratch\nWORKDIR C:/path");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM scratch\nWORKDIR 'C:/path'");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM scratch\nWORKDIR \"C:/path\"");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM scratch\nWORKDIR C:/Program Files");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM scratch\nWORKDIR C:/Program Files/Java");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM scratch\nWORKDIR C:\\path");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM scratch\nWORKDIR C:\\Program Files");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM scratch\nWORKDIR C:\\Program Files\\Java");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM scratch\nWORKDIR $variable");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM scratch\nWORKDIR /$variable");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM scratch\nWORKDIR C$variable");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM scratch\nWORKDIR C:$variable");
                    assert.equal(diagnostics.length, 0);

                    diagnostics = validateDockerfile("FROM scratch\nWORKDIR C:\\$variable");
                    assert.equal(diagnostics.length, 0);
                });

                function createInvalidTest(path: string) {
                    let settings = severity === undefined ? undefined : { instructionWorkdirRelative: severity };
                    let validator = new Validator(settings);
                    let diagnostics = validator.validate(createDocument("FROM scratch\nWORKDIR " + path));
                    if (severity === ValidationSeverity.IGNORE) {
                        assert.equal(diagnostics.length, 0);
                    } else {
                        let diagnosticSeverity = convertValidationSeverity(severity);
                        assert.equal(diagnostics.length, 1);
                        assertWorkdirAbsolutePath(diagnostics[0], diagnosticSeverity, 1, 8, 1, 8 + path.length);
                    }
                }

                it("invalid", function() {
                    createInvalidTest("dev");
                    createInvalidTest("path/");
                    createInvalidTest("C");
                    createInvalidTest("C:");
                    createInvalidTest("C:WINDOWS");
                    createInvalidTest("C:WINDOWS\\system32");
                    createInvalidTest("ZZ:");
                    createInvalidTest("ZZ:\\");
                });
            });
        }

        createAbsolutePathTests("default");
        createAbsolutePathTests("ignore", ValidationSeverity.IGNORE);
        createAbsolutePathTests("warning", ValidationSeverity.WARNING);
        createAbsolutePathTests("error", ValidationSeverity.ERROR);

        it("escape", function() {
            testEscape("WORKDIR", "/or", "ion");
        });
    });
});
