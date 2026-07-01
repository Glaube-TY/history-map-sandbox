<template>
  <header class="app-header">
    <RouterLink class="brand" :to="{ name: 'home' }" aria-label="History Map Sandbox 首页">
      <span class="brand-mark"></span>
      <span class="brand-text">History Map Sandbox</span>
    </RouterLink>

    <nav class="app-nav" aria-label="主导航">
      <RouterLink :to="{ name: 'home' }">专题</RouterLink>
      <RouterLink :to="{ name: 'about' }">关于</RouterLink>
    </nav>
  </header>
</template>
