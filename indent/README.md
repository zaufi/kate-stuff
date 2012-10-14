C++/boost Style Indenter
========================

This indenter (initially) was designed to help code typing in a boost::mpl style
(i.e. w/ leading comma in formatted parameters list). One may read rationale of such
approach in the "C++ Template Metaprogramming: Concepts, Tools, and Techniques from Boost and Beyond"
by David Abrahams and Aleksey Gurtovoy. It is really easy to miss a comma when "calling" templates and
it would leads to really complicated compile errors. This technique helps to visually control syntax
in a stricter way.

Example:

{% highlight c++ %}
    typedef typename boost::mpl::eval_if<
        boost::is_same<iter, boost::mpl::end<types_map>::type>
      , boost::mpl::int_<-1>
      , boost::mpl::distance<boost::mpl::begin<types_map>::type, iter>
      >::type type;
{% endhighlight %}

In practice I've noticed that this style can be used to format long function calls or even
`for` statements. Actually everything that can be split into several lines could be formatted that way.
And yes, it is convenient to have a delimiter (comma, semicolon, whatever) as leading character to
make it visually noticeable.

{% highlight c++ %}
    // Inheritance list formatting
    struct sample
      : public base_1
      , public base_2
      , ...
      , public base_N
    {
        // Parameter list formatting
        void foo(
            const std::string& param_1                      ///< A string parameter
          , double param_2                                  ///< A double parameter
          , ...
          , const some_type& param_N                        ///< An user defined type parameter
          )
        {
            //
            for (
                auto first = std::begin(param_1)
              , last = std::end(param_1)
              ; it != last
              ; ++it
              )
            {
                auto val = check_some_condition()
                  ? get_then_value()
                  : get_else_value()
                  ;
            }
        }
    };
{% endhighlight %}

It looks unusual for awhile :) but later it become "normal" and easily to read and edit :)
Really! When you want to add one more parameter to a function declaration or change order it will
takes less typing comparing to "traditional" way :) (especially if you have some help from editor,
like moving current line or selected block up/down by hotkey or having indenter like this :)

Features
--------

* support for boost-like formatting style
* align inline comments to 60th position after typing `'//'`
* turn `'///'` into `'/// '` or `'///< '` depending on comment placement
* indent preprocessor directives according nesting level of `#if`/`#endif`
*
