<template>
    <div id="app">
        <router-view/>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from "vue-class-component";

    @Component
    export default class App extends Vue {
        name: string = 'app';

        created() {
        }
    }
</script>

<style>
    html, body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
    }

    body,
    div,
    ul,
    li,
    input,
    textarea,
    select,
    option,
    label,
    xmp {
        font-family: NanumSquareR;
        text-align: left;
        font-size: 12px;
    }

    @font-face {
        font-family: "NanumSquareR";
        src: url('./assets/fonts/NanumSquareR/NanumSquareR.eot');
        src: url('./assets/fonts/NanumSquareR/NanumSquareR.eot?#iefix') format('embedded-opentype'), url('./assets/fonts/NanumSquareR/NanumSquareR.woff') format('embedded-opentype');
        src: url('./assets/fonts/NanumSquareR/NanumSquareR.woff') format('embedded-opentype');
    }
    

    #app {
        color: #2c3e50;
        height: 100%;
    }
</style>
