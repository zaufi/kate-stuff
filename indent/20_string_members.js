/*
 * name: Helper String Functions (copied from cstyle.js to be reused by other indenters)
 * license: LGPL v3
 * author: Dominik Haumann <dhdev@gmx.de>, Milian Wolff <mail@milianw.de>
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

//BEGIN String functions
/**
 * \brief Returns \c string without leading spaces.
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
 * \brief Returns \c string without trailing spaces.
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
 * \brief Fills with \c size \c char's.
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

/**
 * \brief Check if \c this string starts with a given.
 */
String.prototype.startsWith = function(str)
{
    return this.slice(0, str.length) == str;
}

/**
 * \brief Check if \c this string ends with a given.
 */
String.prototype.endsWith = function(str)
{
    return this.slice(this.length - str.length, this.length) == str;
}
//END String functions
