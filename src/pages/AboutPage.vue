<template>
  <div class="page-shell">
    <AppHeader />

    <main class="content-page">
      <section class="content-block">
        <p class="eyebrow">About</p>
        <h1>关于 History Map Sandbox</h1>
        <p>
          History Map Sandbox 是一个历史地图沙盘项目，用地图、地形视角、图层和时间轴展示历史事件的空间演变。
          当前项目仅用于历史学习、可视化展示和开源研究。
        </p>
      </section>

      <section class="content-block">
        <h2>数据来源说明</h2>
        <p>
          第一版平型关专题为演示数据，正式专题需要补充史料来源、地图来源、坐标校订说明和数据版本记录。
        </p>
      </section>

      <section class="content-block">
        <h2>地图来源说明</h2>
        <p>
          当前使用 CesiumJS 基础地图能力。后续接入真实底图、地形或第三方地图服务时，应记录来源、许可和使用限制。
        </p>
      </section>

      <section class="content-block">
        <h2>合规与免责声明</h2>
        <p>
          示例数据不是正式史料，不代表精确历史边界、战线、部署或地理结论。公开发布时不要上传敏感数据，
          对历史边界、疆域和战线等内容应谨慎表达并附来源说明。
        </p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue';
</script>
