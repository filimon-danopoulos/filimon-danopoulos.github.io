<!--typescript,work,programming,knockout-->
# TypeScript constructors - another gotcha

I am refactoring a lot of TypeScript code that has explicit AMD modules at work right now.
It uses the JavaScript MVVM libray Knockout and in addition to the AMD modules it has a
bit of "old" TypeScript to glue it together.

## Knockout, briefly

This library has a construct that is called a computed observable.
It basically tracks other values (observables) and outputs a value:

    var someObservable = ko.observable(2);
    var someComputed = ko.computed(() => {
        return someObservable()+2;
    });

    someComputed(); // Gives 2+2 = 4

The callback passed to the computed is executed by Knockout when Knockout wants to. It will evaluate at least once during initialization, and then every time the observable changes.
This is a part of the issue. Any more details than this are outside of the scope of this post.
Look at the official documentation [here](http://knockoutjs.com/documentation/introduction.html) for more details.

## The TypeScript

The explicit AMD modules prevents us from using classes, restricts our selection of tools
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
to begin with is that it is a computed observable, in my case it took up about ten lines of code.
Instead of my constructor growing out of controller I opted for assignment outside of the constructor. This example uses observables and computed observables in order to demonstrate my issue:

    class SomeClass {
        private somePrivate;
        constructor() {
            this.somePrivate  = ko.observable(2);
        }
        public somePublic = ko.computed(() => {
            return this.somePrivate()+2;
        });
    }

When this code is compiled I get:

    function SomeClass {
        this.somePublic = ko.computed(function() {
            return this.somePrivate()+2;
        });
        this.somePrivate = ko.observable(2);
    }

This will obviously not behave as intended since the computed will be evaluated upon instantiation, it
will try to use `this.somePrivate` that happens to be `undefined`. So, we get an error.

## How I solved it

I actually didn't solve it. I decided that it was to large a refactoring for to little gain.
There a lot of possible solutions to the issue with the computeds:

* Declare everything in the constructor. By far the easiest, leads to 200 row constructor.
* Declare nothing in the constructor, and everything in the right order in the body of the class.
Way to easy to loose track of the order in a class, also shitty, nonintuitive design.
* Call a method that set up computeds from the constructor so that the body of the constructor doesn't grown.
The hybrid of the two solutions above, requires the rest of the developers to follow conventions, this is hard.
* Use the builder pattern to handle creation. By far the best solution, since this can easily be tested and
automated. However it deviates to much from the original code, one of the requirements was that the code be similar.

There are probably a couple more. The point is that I could not solve the issue the way I would have wanted.
Instead I decided on typing as much as possible with interfaces. So if I had:

    define([], () => {
        return {
            whatever: ...
        }
    });

I will now have:

    interface ISomeModule {
        whatever: any;
    }

    define([], (): ISomeModule => {
        return <ISomeModule> {
            whatever: ...
        }
    });

It is far from a perfect solution, and I will have to refactor some code to use objects instead of constructor functions but
I this that is a small change in relation to converting everything to `import/export` and classes. Even if it is not perfect, it does improve the tooling significantly and it only slightly modifies the output (in some cases not a all).

I guess some times you have to settle for good enough.
