<template>
  <div class="tracker">
      <p>┃ : <span id="linesCounter"></span></p>
      <p>⬤ : <span id="pointsCounter"></span></p>
      <p>◣ : <span id="trianglesCounter"></span></p>
  </div>
</template>

<style scoped>
    .tracker {
        position: absolute;
        left: 0;
        bottom: 0;
        background-color: white;
        padding: 16px;
        margin: 16px;
        box-shadow:
            0 2.8px 2.2px rgba(0, 0, 0, 0.02),
            0 6.7px 5.3px rgba(0, 0, 0, 0.028),
            0 12.5px 10px rgba(0, 0, 0, 0.035),
            0 22.3px 17.9px rgba(0, 0, 0, 0.042),
            0 41.8px 33.4px rgba(0, 0, 0, 0.05),
            0 100px 80px rgba(0, 0, 0, 0.07);
    }
</style>
