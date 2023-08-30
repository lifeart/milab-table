<script setup lang="ts">
import { computed, ref, toValue, watch } from 'vue'
import type { Model } from './Form.vue'

const props = defineProps<{
  model: Model
  data: Record<string, number | string>[]
}>()

const viewStartIndex = ref(0)
const viewEndIndex = ref(10)
const container = ref<HTMLDivElement | null>(null)
const topPusher = ref<HTMLDivElement | null>(null)
const bottomPusher = ref<HTMLDivElement | null>(null)

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

let timeout: ReturnType<typeof setTimeout> = null as unknown as ReturnType<typeof setTimeout>
let inScrollHandler = false

const visibleOffset = 10
const maxScrollSize = 1000

const scrollModel = {
  isStarted: false,
  relativeOffset: 0,
  startScrollLeft: 0,
  startScrollTop: 0,
  endScrollLeft: 0,
  endScrollTop: 0
}

const onScrollEnd = () => {
  clearTimeout(timeout)

  let mult = 1

  scrollModel.endScrollTop = container.value?.scrollTop ?? 0

  const realRowSize = props.model.rowSize

  let scrollDiff = scrollModel.startScrollTop - scrollModel.endScrollTop

  const isUpScroll = scrollDiff > 0
  const scrollRatio = Math.min(Math.abs(scrollDiff) / maxScrollSize, 1)
  const arraySize = toValue(data).length

  if (scrollRatio > 0.9) {
    mult = Math.pow(scrollRatio * 10, Math.exp(scrollRatio * 2))
    scrollDiff = scrollDiff * mult
  } else if (scrollRatio > 0.6) {
    mult = Math.pow(scrollRatio * 10, Math.exp(scrollRatio + 0.5))
    scrollDiff = scrollDiff * mult
  }

  scrollModel.relativeOffset += scrollDiff

  if (!scrollModel.isStarted) {
    return
  }
  if (!container.value) {
    return
  }
  if (inScrollHandler) {
    return
  }

  const absScrollDiff = Math.min(Math.abs(scrollDiff), arraySize * realRowSize)
  const scrollForOneRow = maxScrollSize / arraySize
  const scrolledRows = Math.ceil(absScrollDiff / realRowSize)

  inScrollHandler = true

  if (scrollDiff === 0 || scrolledRows === 0) {
    requestAnimationFrame(() => {
      inScrollHandler = false
      scrollModel.isStarted = false
    })
    return
  }

  const rowsFromTop = viewStartIndex.value
  scrollModel.relativeOffset = -(rowSize.value * rowsFromTop)
  let startIndex = Math.min(Math.max(0, rowsFromTop + (isUpScroll ? -scrolledRows : scrolledRows)))
  if (startIndex >= arraySize) {
    startIndex = arraySize - visibleOffset
  }
  let endIndex = Math.min(arraySize, startIndex + visibleOffset)
  viewStartIndex.value = startIndex
  viewEndIndex.value = endIndex

  const scrollRowDiff = parseInt((container.value.scrollTop % realRowSize).toFixed(0), 10)

  if (topPusher.value) {
    const topOffset = Math.max(
      (Math.min(rowsFromTop + scrolledRows, arraySize - 1) + 2) * scrollForOneRow - scrollRowDiff,
      0
    )
    const bottomOffset = Math.max(maxScrollSize - topOffset, 0)
    topPusher.value.style.height = `${topOffset}px`
    if (bottomPusher.value) {
      bottomPusher.value.style.height = `${bottomOffset}px`
    }
    requestAnimationFrame(() => {
      inScrollHandler = true
      scrollModel.isStarted = true
      requestAnimationFrame(() => {
        if (container.value) {
          container.value.scrollTop = topOffset
        }
        inScrollHandler = false
        scrollModel.isStarted = false
      })
    })
  }
  requestAnimationFrame(() => {
    inScrollHandler = false
    scrollModel.isStarted = false
  })
}
watch(bottomPusher, () => {
  if (bottomPusher.value) {
    bottomPusher.value.style.height = `${maxScrollSize}px`
  }
})
const hasScrollEnd = computed(() => {
  if (!container.value) {
    return false
  }
  return 'onscrollend' in container.value
})
const onScroll = (e?: Event) => {
  const supportScrollEnd = toValue(hasScrollEnd)
  clearTimeout(timeout)
  if (e && !e.currentTarget) {
    if (!supportScrollEnd) {
      timeout = setTimeout(onScrollEnd, 100)
    }
    return
  }
  if (!container.value) {
    return
  }
  if (inScrollHandler) {
    if (!supportScrollEnd) {
      timeout = setTimeout(onScrollEnd, 100)
    }
    return
  }
  if (scrollModel.isStarted) {
    if (!supportScrollEnd) {
      timeout = setTimeout(onScrollEnd, 100)
    }
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
          <tr ref="topPusher" :style="{ width: '100%' }" class="gradient">
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
      <div ref="bottomPusher" :style="{ width: '100%' }" class="gradient"></div>
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
