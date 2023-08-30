<script setup lang="ts">
import { computed, ref, toValue } from 'vue'

export type Model = {
  cols: number
  rows: number
  colSize: number
  rowSize: number
}

const props = defineProps<{
  onModelChange: (model: Model) => void
  defaultModel: Model
  isLoading: boolean
}>()

const cols = ref(props.defaultModel.cols)
const rows = ref(props.defaultModel.rows)
const colSize = ref(props.defaultModel.colSize)
const rowSize = ref(props.defaultModel.rowSize)

const buttonText = computed(() => {
  return props.isLoading ? 'Loading...' : 'Generate'
})

const onSubmit = (e: Event) => {
  e.preventDefault()
  const model = {
    cols: toValue(cols),
    rows: toValue(rows),
    colSize: toValue(colSize),
    rowSize: toValue(rowSize)
  }
  props.onModelChange(model)
}
</script>
<template>
  <form v-on:submit="onSubmit" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
    <div class="mb-4 flex -mx-2">
      <div class="w-1/2 px-2">
        <label for="amount-of-columns" class="block text-gray-700 text-sm font-bold mb-2">
          Amount of columns
        </label>
        <input
          id="amount-of-columns"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          step="1"
          min="1"
          max="10000000"
          v-model="cols"
        />
      </div>
      <div class="w-1/2 px-2">
        <label for="amount-of-rows" class="block text-gray-700 text-sm font-bold mb-2">
          Amount of rows
        </label>
        <input
          id="amount-of-rows"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          step="1"
          min="1"
          max="10000000"
          v-model="rows"
        />
      </div>
    </div>

    <div class="mb-4 flex -mx-2">
      <div class="w-1/2 px-2">
        <label for="size-of-col" class="block text-gray-700 text-sm font-bold mb-2">Col size</label>
        <input
          id="size-of-col"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          step="1"
          min="1"
          max="10000000"
          v-model="colSize"
        />
      </div>
      <div class="w-1/2 px-2">
        <label for="size-of-row" class="block text-gray-700 text-sm font-bold mb-2">Row size</label>
        <input
          id="size-of-row"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          step="1"
          min="1"
          max="10000000"
          v-model="rowSize"
        />
      </div>
    </div>

    <div class="mb-4">
      <button
        type="submit"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        {{ buttonText }}
      </button>
    </div>
  </form>
</template>
