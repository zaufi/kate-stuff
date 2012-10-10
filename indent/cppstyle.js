/* kate-script
 * name: C++/boost Style
 * license: LGPL
 * author: Alex Turbov <i.zaufi@gmail.com>
 * revision: 1
 * kate-version: 3.4
 * type: indentation
 * priority: 10
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Library General Public
 * License version 2 as published by the Free Software Foundation.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Library General Public License for more details.
 *
 * You should have received a copy of the GNU Library General Public License
 * along with this library; see the file COPYING.LIB.  If not, write to
 * the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA 02110-1301, USA.
 */

// specifies the characters which should trigger indent, beside the default '\n'
// ':' is for `case' and public/protected/private
// '/' is for same-line-comments
// ',' for parameter list
// '<' and '>' is for templates
// '#' is for preprocessor directives
// ')' is for align dangling close bracket
// ';' is for align `for' parts
triggerCharacters = "{})/:;,#<>$";

var debugMode = true;

function dbg()
{
    if (debugMode)
    {
        debug.apply(this, arguments);
    }
}

//BEGIN global variables and functions
var gIndentWidth = 4;
var gSameLineCommentStartAt = 60;
var gMode = "C";
//END global variables and functions

//BEGIN String functions
/**
 * Returns \c string without leading spaces.
 */
String.prototype.ltrim = function()
{
    var i = 0;
    for ( ; i < this.length && (this[i] == ' ' || this[i] == '\t'); ++i ) {
        // continue
    }
    return this.substr(i);
}
/**
 * Returns \c string without trailing spaces.
 */
String.prototype.rtrim = function()
{
    if ( this.length == 0 ) {
        return "";
    }
    var i = this.length - 1;
    for ( ; i >= 0 && (this[i] == ' ' || this[i] == '\t'); --i ) {
        // continue
    }
    return this.substr(0, i + 1);
}
/**
 * Fills with \c size \c char's.
 * \return the string itself (for chain calls)
 */
String.prototype.fill = function(char, size)
{
    var string = "";
    for ( var i = 0; i < size; ++i ) {
        string += char;
    }
    return string;
}
//END String functions

/**
 * \brief Dump some document properties
 */
function showDebugInfo()
{
    c = view.cursorPosition();
    dbg("    Cursor position: ", c.line, ", ", c.column);
    dbg("          MIME-type: ", document.mimeType());
    dbg("              gMode: ", gMode);
    dbg("                 hl: ", document.highlightingMode());
    dbg("          hl@cursor: ", document.highlightingModeAt(view.cursorPosition()));
    dbg("firstVirtualColumn() = ", document.firstVirtualColumn(line));
    dbg(" lastVirtualColumn() = ", document.lastVirtualColumn(line));
    dbg("       firstColumn() = ", document.firstColumn(line));
    dbg("        lastColumn() = ", document.lastColumn(line));
}

/**
 * \brief Handle \c '/' key pressed
 *
 * ... possible it is start of a comment ...
 */
function trySameLineComment(cursor)
{
    var line = cursor.line;
    var column = cursor.column;

    // Possible it is start of the same-line-comment...
    // check is there any text after cursor?
    if (document.nextNonSpaceColumn(line, column) != -1)
        // Yep, there is some text after current position...
        // it looks like user wants to comment a part of the line.
        return;
    // ok, continue...
    var prevColumn = column - 2;
    if (prevColumn >= 0 && document.charAt(line, prevColumn) == '/')
    {
        // Yeah, current char + previous one looks like "//",
        // lets check is there any non space chars before?
        var prevPrevColumn = prevColumn - 1;
        if (prevPrevColumn >= 0 && document.prevNonSpaceColumn(line, prevPrevColumn) != -1)
        {
            // Ok, is there space between last char and 60th position?
            if (prevColumn < gSameLineCommentStartAt)
            {
                var filler = String().fill(' ', gSameLineCommentStartAt - prevColumn) + "//";
                document.editBegin();
                // Remove "//" from the end of the line
                document.removeText(line, prevColumn, line, column);
                // Append "//" w/ leading padding
                document.insertText(line, prevColumn, filler);
                document.editEnd();
            }
        }
    }
}

/**
 * \brief Handler \c ENTER key
 */
function caretPressed(cursor)
{
    var result = -1;
    var line = cursor.line;
    var column = cursor.column;

    // Check if ENTER was hit between ()/{}/[]/<>
    // 0) check if previous/next line is valid
    if (line - 1 < 0 && line + 1 < document.lines())
        return result;                                      // Nothing to do if no previous/next line...

    var firstCharPos = document.lastColumn(line - 1);
    var firstChar = document.charAt(line - 1, firstCharPos);
    var lastCharPos = document.firstColumn(line);
    var lastChar = document.charAt(line, lastCharPos);

    dbg("first char position: " + (line - 1) + ", " + firstCharPos);
    dbg(" last char position: " + (line) + ", " + lastCharPos);
    dbg("         first char: '" + firstChar + "'");
    dbg("          last char: '" + lastChar + "'");

    var isCurveBracketsMatched = (firstChar == '{' && lastChar == '}');
    var isBracketsMatched = isCurveBracketsMatched
        || (firstChar == '[' && lastChar == ']')
        || (firstChar == '(' && lastChar == ')')
        || (firstChar == '<' && lastChar == '>')
        ;
    if (isBracketsMatched)
    {
        var currentIndentation = document.firstVirtualColumn(line - 1);
        dbg("currentIndentation:", currentIndentation);
        result = currentIndentation + gIndentWidth;
        document.editBegin();
        document.insertText(line, document.firstColumn(line), "\n");
        document.indent(new Range(line + 1, 0, line + 1, 1), currentIndentation / gIndentWidth);
        // Add half-tab (2 spaces) if matched not a curve bracket or
        // open character isn't the only one on the line
        var isOpenCharTheOnlyOnLine = (document.firstColumn(line - 1) == firstCharPos);
        if (!(isCurveBracketsMatched || isOpenCharTheOnlyOnLine))
            document.insertText(line + 1, document.firstColumn(line + 1), "  ");
        document.editEnd();
        view.setCursorPosition(line, result);
    }
    // Check if multiline comment was started on the line
    else if (document.startsWith(line - 1, "/*", true))
    {
        var filler = String().fill(' ', document.firstColumn(line - 1) + 1);
        var padding = filler + "* ";
        // If next line doesn't looks like a continue of the current comment,
        // then append comment closer also.
        if (!document.startsWith(line + 1, "*", true))
            padding += "\n" + filler + "*/\n";
        document.insertText(line, 0, padding);
        view.setCursorPosition(line, padding.length + 4);
        result = filler.length;
    }
    // Check if multiline comment continued on the line
    else if (document.firstChar(line - 1) == '*')
    {
        // Try to continue a C-style comment
        document.insertText(line, 0, String().fill(' ', document.firstColumn(line - 1)) + "* ");
    }
    return result;
}

/**
 * \brief Maybe '>' needs to be added?
 *
 * Here is a few cases possible:
 * \li user entered <em>"template &gt;</em>
 * \li user entered smth like <em>std::map&gt;</em>
 */
function tryTemplate(cursor)
{
    var line = cursor.line;
    var column = cursor.column;

    // Check for 'template' keyword at line start
    var currentString = document.line(line);
    var prevWord = document.wordAt(line, column - 1);
    var isCloseAngleBracketNeeded = currentString.match(/^\s*template\s*<$/)
      || prevWord.match(/[A-Za-z_][A-Za-z0-9_]*/)
      ;
    if (isCloseAngleBracketNeeded)
    {
        document.insertText(cursor, ">");
        view.setCursorPosition(cursor);
    }
}

/**
 * \brief Try to align parameters list
 *
 * If (just entered) comma is a first symbol on a line,
 * just move it on a half-tab left relative to a previus line
 * (if latter doesn't starts w/ comma).
 * Do nothing otherwise.
 */
function tryComma(cursor)
{
    var result = -2;
    var line = cursor.line;
    var column = cursor.column;

    if (document.firstChar(line) == ',' && document.firstColumn(line) == (column - 1))
    {
        result = document.firstColumn(line - 1) - (document.firstChar(line - 1) == ',' ? 0 : 2);
        document.insertText(cursor, " ");                   // Add one space after comma
    }
    return result;
}

/**
 * \brief Process one character
 *
 * NOTE Cursor positioned right after just entered character and has +1 in column.
 *
 */
function processChar(line, ch)
{
    var result = -2;                                        // By default, do nothing...
    // ATTENTION Special "trigger" char to SPAM debugging info
    if (ch == '$')
    {
        showDebugInfo();
        return result;
    }

    var cursor = view.cursorPosition();
    if (!cursor)
        return result;

    // TODO Is there any `assert' in JS?
    if (line != cursor.line)
    {
        dbg("ASSERTION FAILURE: line != cursor.line");
        return result;
    }

    var column = cursor.column;

    switch (ch)
    {
        case '\n':
            result = caretPressed(cursor);
            break;
        case '/':
            trySameLineComment(cursor);                     // Possible user wants to start a comment
            break;
        case '<':
            tryTemplate(cursor);                            // Possible need to add closing '>' after template
            break;
        case ',':
            result = tryComma(cursor);                      // Possible need to align parameters list
            break;
        default:
            break;                                          // Nothing to do...
    }

    return result;
}

/**
 * \brief Process a newline or one of \c triggerCharacters character.
 *
 * This function is called whenever the user hits \c ENTER key.
 *
 * It gets three arguments: \c line, \c indentwidth in spaces and typed character
 *
 * Called for each newline (<tt>ch == \n</tt>) and all characters specified in
 * the global variable triggerCharacters. When calling \e Tools->Align
 * the variable \c ch is empty, i.e. <tt>ch == ''</tt>.
 */
function indent(line, indentWidth, ch)
{
    // NOTE Update some global variables
    gIndentWidth = indentWidth;
    gMode = document.highlightingModeAt(view.cursorPosition());

    dbg("indentWidth: " + indentWidth);
    dbg("      gMode: " + gMode);

    if (ch != "")
        return processChar(line, ch);

    return -1;
}

// kate: space-indent on; indent-width 4; replace-tabs on;
