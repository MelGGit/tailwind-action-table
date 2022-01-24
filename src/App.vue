<script setup lang="ts">
import { computed, onMounted, onUpdated, ref } from 'vue';

type modeEnum = 'read' | 'enter' | 'put' | 'shift'
type weekdayShortsEnum = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa' | 'So'
const numberOfDaysInMonth = 31
const rows = 3

const activeButton = ref<number>(0)
const activeMode = ref<modeEnum>('read')
const matrix = ref<number[][]>(createValueMatrix(rows, numberOfDaysInMonth))
const sumFirstMatrixRow = ref<number>(31)
const sumSecondMatrixRow = ref<number>(31)
const sumThirdMatrixRow = ref<number>(31)
const mouseEventRow = ref<number>(-1)
const mouseEventCol = ref<number>(-1)

const tableHead = ['Vertrag', 'Leistung', ...Array.from(Array(numberOfDaysInMonth), (e, i) => i + 1), 'A']
const firstRow = ['', 'Pflegeversicherung', ...createWeeKArray(5, numberOfDaysInMonth), '']
const secondRow = ['', 'morgens', ...Array.from(Array(numberOfDaysInMonth), (e, i) => i + 1), '']
const thirdRow = ['SGB XI HH', 'LK1: KL Morgen/Abendtlt.']
const fourthRow = ['', 'vormittags', ...Array.from(Array(numberOfDaysInMonth), (e, i) => i + 1), '']
const fifthRow = ['SGB XI HH', 'LK5: Lagern/Betten']
const sixthRow = ['', 'mittags', ...Array.from(Array(numberOfDaysInMonth), (e, i) => i + 1), '']
const seventhRow = ['SGB XI HH', 'LK17: Kl. Besorgungen']

function createValueMatrix(rows: number, columns: number): number[][] {
  return Array.from(Array(rows), () => new Array(columns).fill(1))
}

function createWeeKArray(startDay: number, numberOfDays: number): weekdayShortsEnum[] {
  const weekdays: weekdayShortsEnum[] = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const resultArray: weekdayShortsEnum[] = []
  let i = 0
  let j = startDay
  while (i < numberOfDaysInMonth) {
    if (j > 6) j = 0
    resultArray.push(weekdays[j])
    j++
    i++
  }
  return resultArray
}

const reduceFunction = (accumulator: number, currentValue: number | string): number => {
  if (typeof currentValue === 'string') currentValue = 0
  return accumulator + currentValue
}

const sumOfMatrixRow = (matrixIndex: number) => {
  if (matrixIndex === 0) sumFirstMatrixRow.value = matrix.value[0].reduce(reduceFunction)
  if (matrixIndex === 1) sumSecondMatrixRow.value = matrix.value[1].reduce(reduceFunction)
  if (matrixIndex === 2) sumThirdMatrixRow.value = matrix.value[2].reduce(reduceFunction)
}

const isSunday = (index: number, offset: number): string => {
  if ((index + offset) % 7 === 0) return 'bg-neutral-200'
  return ''
}

const isHoliday = (index: number, offset: number): string => {
  if ((index - offset) === 1) return 'bg-green-200'
  return ''
}

const checkSpecialDay = (index: number, offset: number, defaultColor = ''): string => {
  if (isSunday(index, offset) !== '') return isSunday(index, offset)
  if (isHoliday(index, offset) !== '') return isHoliday(index, offset)
  return defaultColor
}

const handleMouseEnterEvent = (row: number, col: number) => {
  mouseEventCol.value = col
  mouseEventRow.value = row
}

const handleMouseLeaveEvent = () => {
  mouseEventCol.value = -1
  mouseEventRow.value = -1
}

const readMode = () => {
  activeButton.value = 0
  activeMode.value = 'read'
}
const enterMode = () => {
  activeButton.value = 1
  activeMode.value = 'enter'
}
const putMode = () => {
  activeButton.value = 2
  activeMode.value = 'put'
}
const shiftMode = () => {
  activeButton.value = 3
  activeMode.value = 'shift'
}
onUpdated(() => {
  console.log(matrix.value)
})

</script>

<template>
  <div class="w-full flex justify-center gap-4 pt-10">
    <button
      :disabled="activeButton === 0"
      :class="activeButton === 0 && 'bg-blue-500'"
      class="border px-4 py-2 rounded hover:bg-blue-500"
      @click="readMode"
    >Lesen</button>
    <button
      :disabled="activeButton === 1"
      :class="activeButton === 1 && 'bg-blue-500'"
      class="border px-4 py-2 rounded hover:bg-blue-500"
      @click="enterMode"
    >Eingabe</button>
    <button
      :disabled="activeButton === 2"
      :class="activeButton === 2 && 'bg-blue-500'"
      class="border px-4 py-2 rounded hover:bg-blue-500"
      @click="putMode"
    >Setzen</button>
    <button
      :disabled="activeButton === 3"
      :class="activeButton === 3 && 'bg-blue-500'"
      class="border px-4 py-2 rounded hover:bg-blue-500"
      @click="shiftMode"
    >Verschieben</button>
  </div>
  <div class="w-full flex justify-center py-20 text-center tracking-wide">
    <table>
      <thead>
        <tr>
          <th
            v-for="(head, i) in tableHead"
            :key="head"
            class="border border-gray-400 py-2 font-normal border-b-black border-b-2"
            :class="isSunday(i, 4) === '' ? isHoliday(i, 1) === '' ? 'bg-gray-100' : isHoliday(i, 1) : isSunday(i, 4)"
          >{{ head }}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td
            v-for="(item, i) in firstRow"
            :key="item"
            class="border text-xs py-1 border-gray-400"
            :class="isSunday(i, 4), isHoliday(i, 1)"
          >{{ item }}</td>
        </tr>
        <tr>
          <td
            v-for="(item, i) in secondRow"
            :key="item"
            class="border text-xs border-gray-400 py-1 text-gray-400 font-thin"
            :class="isSunday(i, 4), isHoliday(i, 1)"
          >{{ item }}</td>
        </tr>
        <tr>
          <td
            v-for="item in thirdRow"
            :key="item"
            class="border border-gray-400 border-b-black border-b-2 px-2"
          >{{ item }}</td>
          <td
            v-for="(x, i) in matrix[0]"
            :key="i"
            class="border border-gray-400 border-b-black border-b-2"
            :class="isSunday(i, 6), isHoliday(i, -1)"
          >
            <input
              type="text"
              :disabled="activeMode === 'read'"
              class="w-10 text-center py-2 px-2"
              v-model.number="matrix[0][i]"
              :class="isSunday(i, 6), isHoliday(i, -1)"
              @change="sumOfMatrixRow(0)"
            />
          </td>
          <td class="border border-gray-400 border-b-black border-b-2">
            <input type="text" class="w-10 text-center py-2 px-2 pointer-events-none" :value="sumFirstMatrixRow" />
          </td>
        </tr>
        <tr>
          <td
            v-for="(item, i) in fourthRow"
            :key="item"
            class="border text-xs border-gray-400 py-1 text-gray-400 font-thin"
            :class="isSunday(i, 4), isHoliday(i, 1)"
          >{{ item }}</td>
        </tr>
        <tr>
          <td
            v-for="item in fifthRow"
            :key="item"
            class="border border-gray-400 border-b-black border-b-2 px-2"
          >{{ item }}</td>
          <td
            v-for="(x, i) in matrix[1]"
            :key="i"
            class="border border-gray-400 border-b-black border-b-2"
            :class="isSunday(i, 6), isHoliday(i, -1)"
          >
            <input
              type="text"
              :disabled="activeMode === 'read'"
              class="w-10 text-center py-2 px-2"
              v-model.number="matrix[1][i]"
              :class="isSunday(i, 6), isHoliday(i, -1)"
              @change="sumOfMatrixRow(1)"
            />
          </td>
          <td class="border border-gray-400 border-b-black border-b-2">
            <input type="text" class="w-10 text-center py-2 px-2 pointer-events-none" :value="sumSecondMatrixRow" />
          </td>
        </tr>
        <tr>
          <td
            v-for="(item, i) in sixthRow"
            :key="item"
            class="border text-xs text-gray-400 font-thin border-gray-400 py-1"
            :class="isSunday(i, 4), isHoliday(i, 1)"
          >{{ item }}</td>
        </tr>
        <tr :class="mouseEventRow === 7 && '!bg-red-400'">
          <td v-for="item in seventhRow" :key="item" class="border border-gray-400 px-2">{{ item }}</td>
          <td
            v-for="(x, i) in matrix[2]"
            :key="i"
            class="border border-gray-400"
            :class="isSunday(i, 6), isHoliday(i, -1)"
            @mouseenter="handleMouseEnterEvent(7, i)"
            @mouseleave="handleMouseLeaveEvent"
          >
            <input
              type="text"
              :disabled="activeMode === 'read'"
              class="w-10 text-center py-2 px-2"
              v-model.number="matrix[2][i]"
              :class="isSunday(i, 6), isHoliday(i, -1)"
              @change="sumOfMatrixRow(2)"
            />
          </td>
          <td class="border border-gray-400">
            <input type="text" class="w-10 text-center py-2 px-2 pointer-events-none" :value="sumThirdMatrixRow" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

 <!-- <input type="text" class="w-10 text-center" v-model.number="matrix[0][0]" /> -->