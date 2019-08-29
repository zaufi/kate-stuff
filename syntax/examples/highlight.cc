/*
 * A block comment w/ alerts:
 * NOTE some note
 * WARNING some warning
 * ATTENTION attention text
 * TODO todo text
 * TBD to be defined
 * FIXME to be fixed later
 */
_Pragma("visibility push")
_Pragma("listing on \"../other.dir\"")

#include "some-local.h"                                     // IWYU pragma: keep
#include <boost/mpl/eval_if.hpp>                            // comment
#include <boost/mpl/bool.hpp>                               /// \custom-tag comment
#if __has_include(<optional>)
# include <optional>
#endif
// Use predefined standard macros
#define MY_THROW(Ex) throw Ex << exception::location_info(__FILE__, __LINE__)
// GCC specific predefined macros
#if defined(__GNUC__) && defined(__linux__)
# define MY_OS "Linux"
#endif

// Highlight IWYU pragmas example
// https://github.com/include-what-you-use/include-what-you-use/blob/master/docs/IWYUPragmas.md
// IWYU pragma: private, include <public.h>
// IWYU pragma: export
// IWYU pragma: no_include "private.h"

namespace mpl {
/**
 * \brief True variadic analog of \c boost::mpl::or_
 *
 * \attention Generic template isn't defined
 */
template <typename...>
struct v_or;

/**
 * \brief True variadic analog of \c boost::mpl::or_
 *
 * \note Specialization to accept at least two parameters
 * \todo Assert that all given types are \e mpl booleans
 */
template <typename T1, typename T2, typename... Tail>
struct v_or<T1, T2, Tail...>
  : boost::mpl::eval_if<                                    // NOLINT
      T1
    , boost::mpl::true_
    , v_or<T2, Tail...>
    >::type
{
    static_assert(sizeof...(Tail) != 0, "Impossible!");
};

/**
 * \brief True variadic analog of \c boost::mpl::or_
 *
 * \note Single parameter specialization
 */
template <typename T>
struct v_or<T> : boost::mpl::bool_<T::type::value>
{
};

}                                                           // namespace mpl

namespace sample { namespace details {
constexpr std::size_t pow_bytes(const std::size_t what, const unsigned d)
{
    return d ? 1'024 * pow_bytes(what, d - 1) : what;
}
}                                                           // namespace details

/// User defined literal: bytes
constexpr std::size_t operator"" _bytes(const unsigned long long size)
{
    return size;
}
/// User defined literal: kibibytes (2^10)
constexpr std::size_t operator"" _KiB(const unsigned long long size)
{
    return zencxx::details::pow_bytes(size, 1);
}
/// User defined literal: mebibytes (2^20)
constexpr std::size_t operator"" _MiB(const unsigned long long size)
{
    return zencxx::details::pow_bytes(size, 2);
}
/// \warning Invalid user defined literal: missed leading underscore
constexpr std::size_t operator"" GiB(const unsigned long long size)
{
    return zencxx::details::pow_bytes(size, 2);
}

constexpr std::size_t BUFFER_SIZE = 10_Mib;                 // user defined literal (const)
constexpr std::size_t MESSAGE_SIZE = 100_Kib;
constexpr std::size_t MAX_PKT_LENGTH = 100'500_bytes;       // user defined literal w/ delimiters
extern thread_local std::string s_thread_name;              // prefixed static variable
extern std::string g_app_name;                              // prefixed global variable
// names w/ leading underscore are reserved by C++ Standard
std::string _reserved;
}                                                           // namespace sample

namespace chars {
const char a = 'a';
const char hex_esc = '\x1b';
const char oct_esc = '\033';
const char cr = '\n';
const char lf = '\r';
const char lf = '\z';                                       // not a valid esc char
const char tab = '\t';
const int multi = 'abcd';
const wchar_t b = L'b';
const wchar_t b_multi = L'abcdefgh';
const char16_t c = u'c';
const char16_t c = u'\u0bac';
const char16_t c_multi = u'abcd';                           // unicode multichars are not allowed
const char32_t d = U'd';
const char32_t d = U'\U12345678';
const char32_t d_multi = U'ab';                             // unicode multichars are not allowed
const auto c = '!'_pnctr;                                   // user defined literal
}                                                           // namespace chars

namespace strings {
const char* a = "Hello\n";
const wchar_t* b = L"Hello\x0d";
const char16_t* c = u"Hello\015";
const char32_t* d = U"Hello\13";
const char* e = u8"Hello UTF-8";
const char* f = R"-(
    Raw string literal
    (no \t esc sequences here \x21)
  )-";
const wchar_t* g = LR"**(Hello %-03s %d %4i %%)**";         // printf-like format string
const char16_t* h = uR"!(Hello)!";
const char32_t* i = UR"@@@(Hello)@@@";
const std::string j = u8R"++(Hello)++";
const std::string h = u8"привет"_RU;                        // user defined literal
const auto s = "Hello"s;                                    // standard string UDL
const auto string_view = u8"Sample"sv;                      // standard string view UDL
const auto smth_else = "Sample"inv;
}                                                           // namespace strings

namespace numbers {
constexpr int a = 123;                                      // decimal
constexpr int a1 = -123'456;                                // decimal w/ delimiters
constexpr int au = 123u;                                    // unsigned decimal
constexpr long al = 123l;                                   // long decimal
constexpr long al = 123l;                                   // long decimal
constexpr long long all = 123ll;                            // long long decimal
constexpr unsigned long long aull = +123ull;                // unsigned long long decimal
constexpr auto a_invalid = 123uull;
constexpr int b = 0123;                                     // octal
constexpr int b1 = -0'123'456;                              // octal w/ delimiters
constexpr int octal_invalid = -0678;
constexpr auto c = 0x123;                                   // hex
constexpr auto c = 0x1234'5678'9abc;                        // hex w/ delimiters
constexpr auto z = 0b1010110001110;                         // binary w/ delimiters
constexpr auto z1 = 0b1'0101'1000'1110;                     // binary w/ delimiters
constexpr auto binary_invalid = 0b012;

const std::complex c = {0, -1i};

const auto d = 10.;
const auto e = 10.01;
const auto f = .01f;

const auto g = 10E10f;
const auto h = +10E10;
const auto i = -10E10;

const auto j = 10E+10;
const auto k = +10E+10f;
const auto l = -10E+10;

const auto m = 10e-10;
const auto o = +10e-10;
const auto p = -10e-10f;

const auto q = 10.01E10;
const auto s = 10.01E+10;
const auto t = 10.01E-10l;

const auto u = 10f;                                         // user defined literals must have a leading underscore

const auto t = 10h;                                         // type std::chrono::duration -- 10 hours
const auto t = 10min;                                       //                            -- 10 minutes
const auto t = 10s;                                         //                            -- 10 seconds
const auto t = 10ms;                                        //                            -- 10 milliseconds
const auto t = 10us;                                        //                            -- 10 microseconds
const auto t = 10ns;                                        //                            -- 10 nanoseconds

}                                                           // namespace numbers

namespace StringLiterals {
const auto string = "Sample"s;
const auto string_view = u8"Sample"sv;
const auto not_a_valid_literal = "Sample"nv;
}

extern void foo() __attribute__((weak));                    // GCC specific attributes

class base
{
public:
    virtual ~base() {}
    virtual void foo() const volatile = 0;
};

class derived : public base
{
    virtual void foo() const volatile override final
    {
        std::cout << __PRETTY_FUNCTION__ << ": " << __DATE__<< std::endl;
    }
    // C++11 attributes
    void exit() [[noreturn, deprecated("Use exit(int) instead")]]
    {
        exit(other_);
    }
    void exit(int a) [[noreturn, gcc::visibility("default")]]
    {
        /// GCC builtins
        if (__builtin_expect(a == 0, 1))
        {
            // ...
        }
    }
    alignas(long) int other_;                               // google code style compatible member name
    int m_member;                                           // prefixed data member
};

template <typename T>
auto abs(T x)
#ifndef __cpp_return_type_deduction
    -> decltype(x < 0 ? -x : x)
#endif
{
    return x < 0 ? -x : x;
}

//  BUG #363227
inline auto test_363227()
{
    1f; -1F;                                                // integer w/ floating suffix
    0.1; -0.1;                                              // fractional constant
    .1; -.1;                                                // fractional constant w/o leading digit seq
    1.; -1.;                                                // ... same, but omit trailing digit seq
    1.f; -1.F;                                              // ... same w/ floating suffix
    1.l; -1.L;                                              // ... same w/ long double suffix
    1e1; -1e1; 1e-1; -1e-1;                                 // digit w/ exponent part
    1e1f; -1e1F; 1e-1F; -1e-1f;                             // ... same w/ floating suffix
    1e1l; -1e1L; 1e-1L; -1e-1l;
    1.0e1; -1.0e1;                                          // fractional constant w/ exponent
    1.0e1f; -1.0e1F; 1.0e-1l; -1.0e-1L;                     // ... same w/ floating suffix
    1.0e1f; -1.0e1F; 1.0e-1l; -1.0e-1L;

    1e1_udl; 1e-1_udl; 1.0e1_udl; 1.0e-1_udl;               // w/ user defined literal suffix
    1._udl; .1_udl; 1.1_udl;

    // std::complex suffixes
    1i; 1if; 1il;
    1.i; 1.if; 1.il;
    1e1i; 1e-1i; 1.0e1i; 1.0e-1i;
    1e1if; 1e-1if; 1.0e1if; 1.0e-1if;
    1e1il; 1e-1il; 1.0e1il; 1.0e-1il;

    return 1.0;
}

// Commented by preprocessor
#if 0
boost::optional<std::string> m_commented;
#else
int not_commended;
#endif

#if true
char also_not_commented;
# if 0
std::string comment = "comment";
# endif
#else
char other_commented;
#endif

#if 0
# define some_multiline_macro() \
    typedef int some;
#else
# define some_multiline_macro() \
    typedef char some;
#endif

_Pragma("visibility pop")

// Modelines: switch to C++ mode
// kate: hl C++;
// kate: indent-width 4;
