<template>
  <div class="app">
    <div class="header"><h2>数字孪生智慧广州管理平台</h2></div>
    <div class="btn-func">
      <div class="btn">
        <button class="diamond-btn">城市全景</button>
      </div>
      <div class="btn"><button class="diamond-btn">城市交通</button></div>
      <div class="btn"><button class="diamond-btn">城市规划</button></div>
      <div class="btn"><button class="diamond-btn">城市管理</button></div>
      <div class="btn"><button class="diamond-btn">城市区域</button></div>
    </div>
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>
<script setup></script>
<style lang="less">
.app {
  height: 100%;
  widows: 100%;
  background-color: #000;
}
.btn-func {
  .btn {
    margin: 0 15px;
  }
}
.header {
  //   padding: 20px 0;
  text-align: center;
  background-color: black;
  //   height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  h2 {
    color: white;
    // font-size: 80px;
    text-align: center;
    font-family: "Orbitron", sans-serif;
    text-shadow: 0 0 20px #29b6f6;
    // animation: flicker 2s infinite;
  }
}

.container {
  width: 100%;
  height: 100%;
  .center {
    width: 100%;
    height: 100%;
  }
}
@keyframes flicker {
  0% {
    text-shadow: 0 0 20px #00ffea;
    transform: scale(1);
  }
  10% {
    text-shadow: 0 0 20px #00ffea, 0 0 20px #00ffea, 0 0 30px #00ffea,
      0 0 40px #00ffea, 0 0 50px #00ffea, 0 0 60px #00ffea;
    transform: scale(1.1);
  }
  20% {
    text-shadow: 0 0 20px #00ffea, 0 0 20px #00ffea, 0 0 30px #00ffea,
      0 0 40px #00ffea, 0 0 50px #00ffea, 0 0 60px #00ffea;
    transform: scale(1);
  }
  30% {
    text-shadow: 0 0 20px #00ffea;
    transform: scale(1);
  }
  100% {
    text-shadow: 0 0 20px #00ffea;
    transform: scale(1);
  }
}
.btn-func {
  display: flex;
  justify-content: center;
}
</style>
