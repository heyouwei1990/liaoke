<template>
  <div class="chooser-component">
    <ul class="chooser-list">
      <li
        v-for="(item, index) in options"
        @click="chosenSelection(index)"
        :class="{active:index === nowIndex}"
      >{{ item.text }}</li>
    </ul>
  </div>
</template>

<script>
  export default {
    props: {
      options: {
        type: Array,
        default: [{
          text: 'test',
          value: 0
        }]
      }
    },
    data () {
      return {
        nowIndex: 0
      }
    },
    methods: {
      chosenSelection (index) {
        this.nowIndex = index
        this.$emit('on-change', this.options[index])
      }
    }
  }
</script>

<style lang="scss">

</style>
