Gluten.js
======

# Description
Gluten.js is a responsive event binding library that lets you easily toggle bindings on an element within different breakpoints. On resize, Gluten will detach and attach events based on your defined breakpoints. Gluten is a standalone library and does not require any dependencies to work.

Gluten is hosted on github and is available under the MIT License.

# Usage

## Initializing
To start, initialize Gluten by calling `Gluten.init()` and pass it a config object. The config object should contain your breakpoint's name(key) and width(value). The breakpoint name can be set to any value you want. The breakpoint width should be a number and is measured in pixels. For example, Gluten could be initialized in the following manner:

``` javascipt
    Gluten.init({
      small: 320,
      medium: 600,
      foo: 800
    });
```

## Settings
The following options can be set:

-
    `Gluten.settings.debug`
    Boolean - when true, will output debug info into to the console. Defaults to false
  <li>
    <code>Gluten.settings.classPrefix</code>
    <p>String - the classPrefix is a prefix prepended to the current breakpoint name. The breakpoint name with the prefix is added as a class to the <code>body</code> tag. Defaults to "screen-"</p>
  </li>
</ul>

