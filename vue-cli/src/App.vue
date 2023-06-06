<template>
  <h1 class="title">hello world</h1>
  <el-button type="primary">按钮</el-button>
  <ul>
    <li><router-link to="/home">去Home</router-link></li>
    <li><router-link to="/about">去About</router-link></li>
  </ul>

  <router-view />
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
.title {
  color: blueviolet;
}
</style>
