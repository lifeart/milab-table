<script setup lang="ts">
import { ref } from 'vue'
import Form from './components/Form.vue'
import Table from './components/Table.vue'
import type { Model } from './components/Form.vue'
import { faker } from '@faker-js/faker'

const data = ref<Record<string, number | string>[]>([])

const dataModel = ref<Model>({
  cols: 60,
  rows: 150,
  colSize: 36,
  rowSize: 38
})

const onModelChange = (model: Model) => {
  const newTableData: Record<string, number | string>[] = new Array(model.rows).fill(null)
  function getRow(i: number) {
    const row: Record<string, number | string> = {
      id: i + 1
    }
    for (let j = 0; j < model.cols; j++) {
      const key = `column${j + 1}`
      const value = faker.color.rgb({ includeAlpha: true })
      row[key] = value
    }
    return row
  }
  data.value = new Proxy(newTableData, {
    get(target, prop) {
      if (prop === 'slice') {
        return (start: number, end: number) => {
          for (let i = start; i < end; i++) {
            if (target[i] === null) {
              target[i] = getRow(i)
            }
          }
          return target.slice(start, end)
        }
      }
      return Reflect.get(target, prop)
    }
  })
  dataModel.value = model
}

onModelChange(dataModel.value)
</script>

<template>
  <main>
    <Form :onModelChange="onModelChange" :defaultModel="dataModel" />
    <Table :model="dataModel" :data="data" />
  </main>
</template>
