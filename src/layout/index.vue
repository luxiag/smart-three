<template>
  <div class="app">
    <div class="header">
      <div class="header-bg">
        <div class="title">数字孪生智慧广州管理平台</div>
      </div>
    </div>
    <div class="btn-func">
      <div class="btn">
        <button
          @click="goPage('cityScene')"
          :class="route.path == '/cityScene' ? 'class-btn active' : 'class-btn'"
        >
          城市概况
        </button>
      </div>
      <div class="btn">
        <button
          @click="goPage('cityPlan')"
          :class="route.path == '/cityPlan' ? 'class-btn active' : 'class-btn'"
        >
          城市规划
        </button>
      </div>
      <div class="btn">
        <button
          @click="goPage('cityManage')"
          :class="
            route.path == '/cityManage' ? 'class-btn active' : 'class-btn'
          "
        >
          智慧管理
        </button>
      </div>
      <div class="btn">
        <button
          @click="goPage('cityTraffic')"
          :class="
            route.path == '/cityTraffic' ? 'class-btn active' : 'class-btn'
          "
        >
          智慧交通
        </button>
      </div>
      <div class="btn">
        <button
          @click="goPage('cityRegion')"
          :class="
            route.path == '/cityRegion' ? 'class-btn active' : 'class-btn'
          "
        >
          区域分析
        </button>
      </div>
    </div>
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>
<script setup>
const router = useRouter();
const route = useRoute();

const goPage = (path) => {
  router.push({ path });
};
onMounted(() => {
  console.log(route.path, "route");
});
</script>
<style lang="less">
.app {
  height: 100%;
  widows: 100%;
  background-color: #000;
  position: relative;

  overflow: hidden;
}
.btn-func {
  position: relative;
  z-index: 11;
  .btn {
    margin: 0 15px;
    .class-btn {
      color: #fff;
      background-color: transparent;
      border: none;
    }

    .class-btn.active,
    .class-btn:hover {
      position: relative;
      display: inline-block;
      /* padding: 5px 10px; */
      color: #fff;

      color: #86dbe3;
      cursor: pointer;
      /* transform: skew(-20deg); */
      /* border-radius: 0; */
      /* box-shadow: 0 5px 0 rgba(0, 0, 0, 0.3); */
      transition: box-shadow 0.2s ease-in-out;
      text-shadow: 0 0 20px #29b6f6;
      &::after {
        content: "";
        position: absolute;
        top: 0;
        left: -1px;
        width: 100%;
        /* box-shadow: 0px 3px 0px 0px rgba(0, 0, 0, 0.2); */
        height: 100%;
        border: 1px solid #7dd1d9;
        background: rgba(29, 53, 56, 0.6);
        transform: skew(-20deg);
        box-shadow: 0 0 5px #7dd1d9;
        /* border-image: linear-gradient(45deg, #fff, #7dd1d9) 1; */
        z-index: -1;
      }
    }
  }
}

.header {
  //   padding: 20px 0;
  text-align: center;
  // background-color: black;
  //   height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 11;
  position: relative;

  h2 {
    color: white;
    // font-size: 80px;
    text-align: center;
    font-family: "Orbitron", sans-serif;
    text-shadow: 0 0 20px #29b6f6;
    // animation: flicker 2s infinite;
  }
  .header-bg {
    padding: 0 180px;
    background: radial-gradient(circle, #5b96b4, transparent);
    margin-bottom: 10px;
  }
  .header-bg::before {
  }
  .title {
    padding: 10px 20px;
    margin: 0;
    font-weight: 700;
    font-size: 1.1em;
    // border-bottom: 5px solid #afd7f0;
    // margin-bottom: 10px;
    // background: radial-gradient(circle, #5b96b4, #344a52);
  }
}

.container {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  .center {
    width: 100%;
    height: 100%;
  }
}

.parallelogram {
  width: 200px;
  height: 100px;
  background: #0074d9;
  transform: skew(-20deg);
  position: relative;
}

.parallelogram::before,
.parallelogram::after {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.parallelogram::before {
  top: 0;
  left: -20px;
  border-width: 0 20px 100px 0;
  border-color: transparent #0074d9 transparent transparent;
}

.parallelogram::after {
  bottom: 0;
  right: -20px;
  border-width: 100px 0 0 20px;
  border-color: transparent transparent transparent #0074d9;
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
