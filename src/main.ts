/* --------------------------------------------------------------------------------------------
 * Copyright (c) Remy Suen. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import { TextDocument, Diagnostic, TextEdit, FormattingOptions } from 'vscode-languageserver-types';
import { DockerFormatter } from './dockerFormatter';
import { Validator } from './dockerValidator';

/**
 * Error codes that correspond to a given validation error. These
 * values are exposed for the purpose of allowing clients to identify
 * what kind of validation error has occurred and to then prompt
 * action that is appropriate for resolving the error to the user.
 * 
 * Note that the names and values of these errors are not considered
 * to be API and may change between releases of dockerfiles-util.
 * This is because the Docker builder's errors and error messages are
 * itself not considered to be API. Thus, Dockerfiles that originally
 * would not build and throw an error may stop throwing an error 
 * a future release of Docker due to newly added features. This would
 * then mean that an error (code and message) is no longer valid and
 * should thus be removed. Hence, this list of error codes is not
 * stable and as aforementioned may change between releases of
 * dockerfile-utils.
 */
export enum ValidationCode {
    CASING_INSTRUCTION,
    CASING_DIRECTIVE,
    ARGUMENT_MISSING,
    ARGUMENT_EXTRA,
    ARGUMENT_REQUIRES_ONE,
    ARGUMENT_REQUIRES_AT_LEAST_ONE,
    ARGUMENT_REQUIRES_TWO,
    ARGUMENT_REQUIRES_AT_LEAST_TWO,
    ARGUMENT_REQUIRES_ONE_OR_THREE,
    ARGUMENT_UNNECESSARY,
    DUPLICATE_BUILD_STAGE_NAME,
    EMPTY_CONTINUATION_LINE,
    INVALID_BUILD_STAGE_NAME,
    FLAG_AT_LEAST_ONE,
    FLAG_DUPLICATE,
    FLAG_INVALID_DURATION,
    FLAG_LESS_THAN_1MS,
    FLAG_MISSING_DURATION,
    FLAG_MISSING_VALUE,
    FLAG_UNKNOWN_UNIT,
    NO_SOURCE_IMAGE,
    INVALID_ESCAPE_DIRECTIVE,
    INVALID_AS,
    INVALID_DESTINATION,
    INVALID_PORT,
    INVALID_PROTO,

    /**
     * The error code used if the base image of a FROM instruction
     * has an invalid tag or digest specified.
     */
    INVALID_REFERENCE_FORMAT,
    INVALID_SIGNAL,
    INVALID_SYNTAX,
    ONBUILD_CHAINING_DISALLOWED,
    ONBUILD_TRIGGER_DISALLOWED,
    SHELL_JSON_FORM,
    SHELL_REQUIRES_ONE,
    SYNTAX_MISSING_EQUALS,
    SYNTAX_MISSING_NAMES,
    SYNTAX_MISSING_SINGLE_QUOTE,
    SYNTAX_MISSING_DOUBLE_QUOTE,
    MULTIPLE_INSTRUCTIONS,
    UNKNOWN_INSTRUCTION,
    UNKNOWN_ADD_FLAG,
    UNKNOWN_COPY_FLAG,
    UNKNOWN_HEALTHCHECK_FLAG,
    UNKNOWN_TYPE,
    UNSUPPORTED_MODIFIER,
    DEPRECATED_MAINTAINER,
    HEALTHCHECK_CMD_ARGUMENT_MISSING,
    FLAG_INVALID_FROM_VALUE,

    /**
     * The error code used if an instruction has arguments written in
     * JSON form except that it is not actually valid JSON because
     * single quotes are used instead of double quotes.
     */
    JSON_IN_SINGLE_QUOTES,

    /**
     * The error code used if a WORKDIR instrction does not point to
     * an absolute path.
     */
    WORKDIR_IS_NOT_ABSOLUTE,

    /**
     * The error code used if a FROM instruction uses a variable to
     * reference its base image but the variable does not exist.
     */
    BASE_NAME_EMPTY
}

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

    instructionJSONInSingleQuotes?: ValidationSeverity;

    /**
     * The setting for flagging WORKDIR instructions that do not use
     * an absolute path.
     */
    instructionWorkdirRelative?: ValidationSeverity;
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
