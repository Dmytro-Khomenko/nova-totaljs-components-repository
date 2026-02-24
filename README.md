# TotalJS custom components repository

### To access the repository use following repository URL (published via github pages)
https://dmytro-khomenko.github.io/nova-totaljs-components-repository/repository.json

<br/>
<br/>

---
# TotalJS soltuion notes

##  Useful links about Flow:
- https://www.totaljs.com/flow
- https://docs.totaljs.com/flow
- https://github.com/totaljs/flow
- https://docs.totaljs.com/flowstream/d27dc002rl50c/#d27e4002rl50c

<br/>

##  Code structure basics for TotalJS Flow components:
```
<script total>
</script>

<settings>
</settings>

<style>
</style>

<body>
    <header>
        <i class="$ICON"></i>$NAME
    </header>
</body>

<readme>
</readme>
```

<br/>

##  Official components initial template:
- Watch in `official templates` folder

<br/>

## Versions management:
- components code contains version defining parameter `exports.version = '1.0.0'`
- initial version must be `1.0.0`
- if made elements addition (e.g. new button, new dropdown, new section, etc) then update version in code in that way `1.1.1`, `1.2.2`, `1.3.3` and so on
- if made component or element adjustment only  (e.g. change name, change color, chane style, chneg width, change paddings, change font, etc) then update version in code in that way `1.1.1`, `1.1.2` , `1.1.3` and so on until `1.1.99`

<br/>

## Use COMPONENTATOR for components implementation
Basic links
- https://docs.totaljs.com/components/q24m001me41d
- https://docs.totaljs.com/total4/407ff001jy51c/#x6vp001kb41d

Components repository:
- https://componentator.com
- https://github.com/totaljs/components/tree/master


### Tutorial: How to use j-Input
- part 1:  https://blog.totaljs.com/posts/2292975001ft71b
- part 2: https://blog.totaljs.com/posts/2677785001js71b


### Tutorial: Data Binding
- part 1:  https://blog.totaljs.com/posts/2414454001xp71b
- part 2: https://blog.totaljs.com/posts/2443033001dx71b


### Tutorial: How to use j-Directory
- https://blog.totaljs.com/posts/2689349001ue71b
