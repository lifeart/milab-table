<script setup lang="ts">
import { ref } from 'vue'
import Form from './components/Form.vue'
import Table from './components/Table.vue'
import type { Model } from './components/Form.vue'
import { faker } from '@faker-js/faker'

const data = ref<Record<string, number | string>[]>([])
const isLoading = ref(false)
const sliceSize = 500

const dataModel = ref<Model>({
  cols: 60,
  rows: 50000,
  colSize: 36,
  rowSize: 38
})

type Token = {
  cancel: boolean
}

function* generateDataInMainLoop(rawSliceSize: number, model: Model, token: Token) {
  isLoading.value = true
  const sliceSize = Math.min(rawSliceSize, model.rows)
  const amountOfChunks = Math.ceil(model.rows / sliceSize)
  const newTableData: Record<string, number | string>[] = new Array(model.rows).fill(null)
  for (let i = 0; i < amountOfChunks; i++) {
    if (token.cancel) {
      return
    }
    for (let j = 0; j < sliceSize; j++) {
      const row: Record<string, number | string> = {
        id: i * sliceSize + j + 1
      }
      for (let k = 0; k < model.cols; k++) {
        const key = `column${k + 1}`
        const value = faker.color.rgb({ includeAlpha: true })
        row[key] = value
      }
      newTableData[i * sliceSize + j] = row
    }
    if (token.cancel) {
      return
    }

    yield new Promise((resolve) => {
      setTimeout(() => {
        resolve(null)
      }, 0)
    })
  }
  isLoading.value = false
  return newTableData
}

let generatorTask = null as unknown as Generator<
  Promise<unknown>,
  Record<string, string | number>[] | undefined,
  unknown
>
let tokenScope: Token = {
  cancel: false
}

const onModelChangeAsync = async (model: Model) => {
  let newTableData: Record<string, number | string>[] = []
  if (generatorTask) {
    tokenScope.cancel = true
    generatorTask.return(void 0)
  }
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(null)
    }, 0)
  })
  tokenScope.cancel = false
  const generator = generateDataInMainLoop(sliceSize, model, tokenScope)
  generatorTask = generator

  while (true) {
    const { value, done } = generator.next()
    if (done) {
      const data = await value
      if (Array.isArray(data)) {
        newTableData = data
      } else {
        return
      }
      break
    }
    await value
  }

  data.value = newTableData
  dataModel.value = model
}

onModelChangeAsync(dataModel.value)

// onModelChange(dataModel.value)

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
</script>

<template>
  <main>
    <Form :onModelChange="onModelChangeAsync" :defaultModel="dataModel" :isLoading="isLoading" />
    <Table :model="dataModel" :data="data" />
  </main>
</template>
