<script setup lang="ts">
import { computed, ref, toValue, nextTick } from 'vue'
import type { Model } from './Form.vue'

const props = defineProps<{
  model: Model
  data: Record<string, number | string>[]
}>()

const viewStartIndex = ref(0)
const viewEndIndex = ref(10)
const tableScrollHeight = ref(0)
const container = ref<HTMLDivElement | null>(null)
const scrollYHolder = ref<HTMLTableRowElement | null>(null)

const data = computed(() => {
  return props.data
})
const model = computed(() => {
  return props.model
})
const view = computed(() => {
  return data.value.slice(toValue(viewStartIndex), toValue(viewEndIndex))
})
const colSize = computed(() => {
  return toValue(model).colSize
})
const rowSize = computed(() => {
  return toValue(model).rowSize
})
const cols = computed(() => {
  return toValue(model).cols
})
const rows = computed(() => {
  return toValue(model).rows
})

let timeout: ReturnType<typeof setTimeout> = null as unknown as ReturnType<typeof setTimeout>
let inScrollHandler = false

const visibleOffset = 10
const offsetBottom = Math.round(visibleOffset / 2)

const scrollModel = {
  isStarted: false,
  startScrollLeft: 0,
  startScrollTop: 0,
  endScrollLeft: 0,
  endScrollTop: 0
}

const onScrollEnd = () => {
  clearTimeout(timeout)
  if (!scrollModel.isStarted) {
    return
  }
  if (!container.value) {
    return
  }
  if (!scrollYHolder.value) {
    return
  }
  if (inScrollHandler) {
    return
  }
  const realRowSize = props.model.rowSize

  inScrollHandler = true

  const node = container.value
  scrollModel.endScrollLeft = node.scrollLeft
  scrollModel.endScrollTop = node.scrollTop

  const scrolledRows = Math.round(node.scrollTop / realRowSize)
  const visibleRows = Math.ceil(container.value.clientHeight / realRowSize)

  let endIndexToSlice = scrolledRows + visibleRows + offsetBottom

  const arraySize = toValue(data).length

  if (endIndexToSlice > arraySize) {
    endIndexToSlice = arraySize
  }
  let startIndexToSlice = Math.max(0, endIndexToSlice - visibleRows - visibleOffset)
  if (startIndexToSlice === endIndexToSlice) {
    startIndexToSlice = Math.max(0, visibleRows + visibleOffset)
  }

  if (viewStartIndex.value === startIndexToSlice || viewEndIndex.value === endIndexToSlice) {
    inScrollHandler = false
    scrollModel.isStarted = false
    return
  }

  viewStartIndex.value = Math.max(0, startIndexToSlice - (visibleOffset - offsetBottom))
  viewEndIndex.value = endIndexToSlice

  requestAnimationFrame(() => {
    if (scrollYHolder.value) {
      scrollYHolder.value.style.height = `${Math.max(
        0,
        scrolledRows * realRowSize - offsetBottom * realRowSize
      )}px`
    }
  })

  const reScrollOffset =
    container.value.scrollTop + (view.value.length - (visibleOffset - offsetBottom)) * realRowSize

  if (view.value[0].id === 0) {
    tableScrollHeight.value = 0
  } else {
    tableScrollHeight.value = reScrollOffset
  }

  nextTick(() => {
    inScrollHandler = false
    scrollModel.isStarted = false
  })
}
const onScroll = () => {
  clearTimeout(timeout)
  if (!container.value) {
    return
  }
  if (inScrollHandler) {
    return
  }
  if (scrollModel.isStarted) {
    return
  }
  scrollModel.isStarted = true
  scrollModel.startScrollLeft = container.value.scrollLeft
  scrollModel.startScrollTop = container.value.scrollTop
  timeout = setTimeout(onScrollEnd, 100)
}

const tableWidth = computed(() => {
  return toValue(cols) * toValue(colSize)
})
const tableHeight = computed(() => {
  let value =
    toValue(rows) * toValue(rowSize) -
    toValue(tableScrollHeight) -
    (container.value?.clientHeight ?? 0)
  return value < 0 ? 0 : value
})
const headers = computed(() => {
  const headers: string[] = ['ID']
  for (let i = 0; i < toValue(cols); i++) {
    headers.push(`${i + 1}`)
  }
  return headers
})
</script>
<template>
  <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-4">
    <div
      ref="container"
      class="table-container"
      v-on:scroll="onScroll"
      v-on:scrollend="onScrollEnd"
    >
      <table :style="{ width: `${tableWidth}px` }">
        <thead>
          <tr>
            <th v-for="header in headers" :key="header" :style="{ width: `${colSize}px` }">
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody v-if="view.length">
          <tr ref="scrollYHolder" class="gradient">
            <td v-bind:colspan="cols"></td>
          </tr>
          <tr v-for="row in view" :key="row.id" :style="{ height: `${rowSize}px` }">
            <td v-for="col in row" :key="col">
              <div
                :style="{
                  width: `${colSize}px`,
                  height: `${rowSize}px`,
                  background: col
                }"
              >
                {{ typeof col === 'number' ? col : '' }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-bind:style="{ height: `${tableHeight}px`, width: '100%' }" class="gradient"></div>
    </div>
  </div>
</template>
<style>
.table-container {
  max-height: 50vh;
  min-height: 25vh;
  overflow: auto;
  width: 100%;
}
table thead tr {
  background: white;
  position: sticky;
  top: 0; /* Don't forget this, required for the stickiness */
  box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);
}
table {
  text-align: left;
  position: relative;
  border-collapse: collapse;
  border-spacing: 0;
}
table td {
  padding: 0;
}
.gradient {
  background-image: linear-gradient(
    0deg,
    #ffffff 25%,
    #f2f2f2 25%,
    #f2f2f2 50%,
    #ffffff 50%,
    #ffffff 75%,
    #f2f2f2 75%,
    #f2f2f2 100%
  );
  background-size: 144px 144px;
}
</style>
