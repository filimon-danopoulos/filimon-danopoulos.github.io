<!--typescript,work,programming,knockout-->
# TypeScript constructors - another gotcha

I am refactoring a lot of TypeScript code that has explicit AMD modules at work right now.
It uses the JavaScript MVVM libray Knockout and in addition the AMD modules it has a
bit of "old" TypeScript to glue it together.

## Knockout briefly

This library has a construct that is called a computed observable.
It basically tracks other values (observables) and outputs a value:

    var someObservable = ko.observable(2);
    var someComputed = ko.computed(() => {
        return someObservable()+2;
    });

    someComputed(); // Gives 2+2 = 4

The callback passed to the computed is executed by Knockout when Knockout deems it right.
That is a part of the issue. Any more details than this are outside of the scope of this post.
Look at the official documentation [here](http://knockoutjs.com/documentation/introduction.html) for more.

## The TypeScript

The explicit AMD modules prevents us from using classes. Restricts our selection of tools
and generally makes for a worse development experience.

The plan is to convert them so that they are classes and use `import/export` instead.
Basically I have this:

    define(["dependency"], (dependency) => {
        function Module() {}

        return Module;
    });

and I want to convert it to this:

    import dependency = require("dependency");
    class Module {}

    export = Module;

The idea is that the output should be exactly the same as before, and everything should still work
as before.

## Problems...

Now something interesting happens, when I convert this code (slimed down example of my case):

    define([], () => {
        var someFunction = () => {
            var somePrivate = 2;
            this.somePublic = 5;
        };

        return someFunction;
    });

I reason that everything declared as a `var` should be private, everything attached to `this`
should be public. This initially gives me:

    class SomeClass {
        private somePrivate: number = 2;
        public somePublic: number = 5;
    }

    export = SomeClass;

I then reason I should use a constructor for initial assignment.
But for a reason that will apparent soon I only do it for part of the class:

    class SomeClass {
        private somePrivate: number;
        constructor() {
            this.somePrivate  = 2;
        }
        public somePublic: number = 5;
    }

This in turn generates something similar to this:

    function SomeClass {
        this.somePublic = 5;
        this.somePrivate  = 2;
    }

That is `somePublic` is assigned first and then the contents of the TypeScript constructor
are executed. This makes total sense, even if I got stuck on this at first glance.
If the order was reversed you could not use the class's members in the constructor since
some of them might be assigned just as I do here, i.e. outside of the constructor. If some private
had the value `() => {}`, one would expect to be able to execute that it the constructor.

Now this leads to the problem, the reason I did not include `somePublic` in the constructor
to begin with is that it is a computed observable, that takes up about ten lines of code.
Instead of my constructor growing out of controller I opted for assignment outside of the constructor:

    class SomeClass {
        private somePrivate: number;
        constructor() {
            this.somePrivate  = 2;
        }
        // Type skipped for brevity.
        public somePublic = ko.computed(() => {
            return this.somePrivate+2;
        });
    }

When this code is compiled I get:

    function SomeClass {
        this.somePublic = ko.computed(function() {
            return this.somePrivate+2;
        });;
        this.somePrivate  = 2;
    }
