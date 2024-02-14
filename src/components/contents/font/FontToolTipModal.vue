<template>
    <modal name="font-tooltip"
      :click-to-close="true"
      :reset="true"
      :width="950"
      :height="455"
      :min-width="950"
      :min-height="455"
    >
    <div class="block">
      <el-carousel
        trigger="click"
        height="458px"
        arrow="always"
        :autoplay="false"
        ref="carousel"
        @change="hideArrow()"
      >
        <el-carousel-item>
          <div class="tooltip-wrapper">
            <h1>Step1. Create a Font Folder</h1>
            <div class="tooltip-step1-wrapper">
              <img src="@/assets/image/FontToolTip/step1.png" />
              <div class="support-font-container">
                <span>Support Font Format</span>
                <div class="font-wrapper">
                  <img src="@/assets/image/FontToolTip/ttf.png" />
                  <img src="@/assets/image/FontToolTip/eot.png" />
                  <img src="@/assets/image/FontToolTip/woff.png" />
                  <img src="@/assets/image/FontToolTip/woff2.png" />
                </div>
              </div>
            </div>
          </div>
        </el-carousel-item>
        <el-carousel-item>
          <div class="tooltip-wrapper">
            <h1>Step2. Create a Zip File</h1>
            <div class="tooltip-step2-wrapper">
              <img src="@/assets/image/FontToolTip/step2-1.png" />
              <img src="@/assets/image/FontToolTip/step2-2.png" />
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
    </modal>
</template>1

<script lang="ts">
  import {Component, Vue} from "vue-property-decorator";

  @Component
  export default class FontToolTipModal extends Vue {
    hideArrow (): void {
      const activeIndex: number = this.$refs.carousel.activeIndex;
      const hideArrow: Array<object> = this.$refs.carousel.$el.querySelectorAll('button');

      hideArrow[activeIndex].style.display = 'none';
      
      activeIndex < 1 ? 
        hideArrow[activeIndex + 1].style.display = 'inline-block' :
        hideArrow[activeIndex - 1].style.display = 'inline-block';
    }
  }
</script>

<style scoped>
  .tooltip-container {
    display: flex;
    height: 438px;
    
  }

  .tooltip-wrapper {
    display: flex;
    width: 100%;
    flex-direction: column;
  }

  .tooltip-wrapper h1 {
    margin: 3%;
    color: #ffffff;
  }

  .tooltip-step1-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: space-around;    
    align-items: center;
    margin: 0% 5%;
  }

  .tooltip-step1-wrapper > img { 
    width: 400px;
    height: 322px;
  }

  .support-font-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .support-font-container span {
    color: #ffffff;
    font-size: 2em;
    font-weight: bold;
  }

  .font-wrapper { 
    display: grid;
    grid-template-rows: repeat(2, 150px);
    grid-template-columns: repeat(2, 1fr);
  }

  .font-wrapper img {
    height: 120px;
    margin: 10px;
  }

  .tooltip-step2-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: space-around;    
    align-items: center;
    margin: 0% 5%;
  }

  .tooltip-step2-wrapper img {
    width: 380px;
    height: 290px;
  }

  .el-carousel__item {
    background-color: #99a9bf
  }
</style>
