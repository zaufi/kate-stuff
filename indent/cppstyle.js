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
var gBraceMap = {
    '(': ')', ')': '('
  , '<': '>', '>': '<'
  , '{': '}', '}': '{'
  , '[': ']', ']': '['
  };
//END global variables and functions

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
    dbg("firstVirtualColumn() = ", document.firstVirtualColumn(c.line));
    dbg(" lastVirtualColumn() = ", document.lastVirtualColumn(c.line));
    dbg("       firstColumn() = ", document.firstColumn(c.line));
    dbg("        lastColumn() = ", document.lastColumn(c.line));
}

/**
 * \brief Handle \c '/' key pressed
 *
 * Check if is it start of a comment. Here is few cases possible:
 * \li very first \c '/' -- do nothing
 * \li just entered \c '/' is a second in a sequence. If no text before or some present after,
 *     do nothing, otherwise align a \e same-line-comment to \c gSameLineCommentStartAt
 *     position.
 * \li just entered \c '/' is a 3rd in a sequence. If there is some text before and no after,
 *     it looks like inlined doxygen comment, so append \c '<' char after. Do nothing otherwise.
 */
function trySameLineComment(cursor)
{
    var line = cursor.line;
    var column = cursor.column;
    // Try to split line by comment
    var match = /^([^\/]*)(\/\/+)(.*)$/.exec(document.line(line));
    dbg("match_before  = '" + match[1] + "'");
    dbg("match_comment = '" + match[2] + "'");
    dbg("match_after   = '" + match[3] + "'");

    if (match != null)                                      // Is matched?
    {
        if (match[2] == "///" && match[3].length == 0)
        {
            // 3rd case here!
            document.insertText(cursor, "< ");
        }
        else if (match[2] == "//" && match[1].length != 0 && match[3].length == 0)
        {
            // 2nd case here! Check if padding required
            if (match[1].length < gSameLineCommentStartAt)
            {
                var filler = String().fill(' ', gSameLineCommentStartAt - match[1].length) + "//";
                document.editBegin();
                document.removeText(line, column - 2, line, column);
                document.insertText(line, column - 2, filler);
                document.editEnd();
            }
        }
    }
}

/**
 * \brief Handle \c ENTER key
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
        var filler = String().fill(' ', document.firstColumn(line - 1));
        // Try to continue a C-style comment
        document.insertText(line, 0, filler + "* ");
        result = filler.length;
    }
    else
    {
        var currentString = document.line(line - 1);
        var r = /^(\s*)((if|for|while)\s*\(|do|else|(default|case\s+.*)\s*:).*$/.exec(currentString);
        if (r != null)
            result = r[1].length + gIndentWidth;
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
      || prevWord.match(/[A-Za-z_][A-Za-z0-9_]*/)           // Does a word before '<' looks like identifier?
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
 * (if latter doesn't starts w/ comma or ':').
 * Do nothing otherwise.
 */
function tryComma(cursor)
{
    var result = -2;
    var line = cursor.line;
    var column = cursor.column;

    if (document.firstChar(line) == ',' && document.firstColumn(line) == (column - 1))
    {
        var prevLineFirstChar = document.firstChar(line - 1);
        var mustMove = !(prevLineFirstChar == ',' || prevLineFirstChar == ':');
        result = document.firstColumn(line - 1) - (mustMove ? 2 : 0);
        document.insertText(cursor, " ");                   // Add one space after comma
    }
    return result;
}

/**
 * \brief Try to align a given close bracket
 */
function tryCloseBracket(cursor, ch)
{
    var result = -2;
    var line = cursor.line;
    var column = cursor.column;

    // Check if a given closing brace is a first char on a line
    // (i.e. it is 'dangling' brace)...
    if (document.firstChar(line) == ch && document.firstColumn(line) == (column - 1))
    {
        var braceCursor = new Cursor().invalid();
        if (ch != '>')
            braceCursor = document.anchor(line, column - 1, gBraceMap[ch]);
            // TODO Otherwise, it seems we have a template parameters list...
        if (braceCursor.isValid())
            result = document.firstColumn(braceCursor.line);
    }

    return result;
}

/**
 * \brief Indent new scope block
 *
 * ... try to unindent to be precise...
 *
 * \todo Deduplicate code w/ \c caretPressed()
 */
function tryBlock(cursor)
{
    var result = -2;
    var line = cursor.line;
    var column = cursor.column;

    var currentString = document.line(line - 1);
    var r = /^(\s*)((if|for|while)\s*\(|do|else|(default|case\s+.*)\s*:).*$/.exec(currentString);
    dbg("r=",r)
    if (r != null)
        result = r[1].length;
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
        case '}':
        case ')':
        case ']':
        case '>':
            result = tryCloseBracket(cursor, ch);           // Try to align a given close bracket
            break;
        case '{':
            result = tryBlock(cursor);
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
