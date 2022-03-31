<template>
  <div>
    <div></div>
    <div className="main-container">
      <slot></slot>
    </div>
    <div class="footer"></div>
  </div>
</template>

<script>
export default {
  name: "BasicLayout",
  props: {},
};
</script>

<style scoped>
.main-container {
  padding: 20px;
}
.footer {
  position: absolute;
  bottom: 0px;
}
</style>