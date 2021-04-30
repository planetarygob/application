<template>
  <div class="absolute bottom-0 w-full flex justify-center mb-14">
    <span class="text-white font-bold border border-white rounded-full px-8 py-2">{{ instruction }}</span>
</div>
</template>

<script>
export default {
    props: {
        instruction: {
            type: String,
            default: null
        },
        isDisplayed: {
            type: Boolean,
            default: false
        }
    }
}
</script>

<style>

</style>