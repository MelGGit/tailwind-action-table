<script setup lang="ts">
import { computed, ref } from 'vue';

type modeEnum = 'read' | 'enter' | 'put' | 'shift'
type weekdayShortsEnum = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa' | 'So'
const numberOfDaysInMonth = 31
const rows = 3

const putNumber = ref<number>(1)
const activeButton = ref<number>(0)
const activeMode = ref<modeEnum>('read')
const matrix = ref<number[][]>(createValueMatrix(rows, numberOfDaysInMonth))
const sumFirstMatrixRow = ref<number>(31)
const sumSecondMatrixRow = ref<number>(31)
const sumThirdMatrixRow = ref<number>(31)
const mouseEventRow = ref<number>(-1)
const mouseEventCol = ref<number>(-1)
const putInput = ref<HTMLInputElement>()

const tableHead = ['Vertrag', 'Leistung', ...Array.from(Array(numberOfDaysInMonth), (e, i) => i + 1), 'A']
const firstRow = ['', 'Pflegeversicherung', ...createWeeKArray(5, numberOfDaysInMonth), '']
const secondRow = ['', 'morgens', ...Array.from(Array(numberOfDaysInMonth), (e, i) => i + 1), '']
const thirdRow = ['SGB XI HH', 'LK1: KL Morgen/Abendtlt.']
const fourthRow = ['', 'vormittags', ...Array.from(Array(numberOfDaysInMonth), (e, i) => i + 1), '']
const fifthRow = ['SGB XI HH', 'LK5: Lagern/Betten']
const sixthRow = ['', 'mittags', ...Array.from(Array(numberOfDaysInMonth), (e, i) => i + 1), '']
const seventhRow = ['SGB XI HH', 'LK17: Kl. Besorgungen']

const cursorPointer = computed(() => activeMode.value === 'put' || activeMode.value === 'shift' ? 'cursor-pointer' : '')

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
  return Number(accumulator) + Number(currentValue)
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

const getHighlightState = (row: number, col: number): string | void => {
  if ((row === mouseEventRow.value && col <= mouseEventCol.value) || (row <= mouseEventRow.value && col === mouseEventCol.value)) return '!bg-zinc-300'
}

const updateValueOnPut = (row: number, index: number) => {
  matrix.value[row][index] = putNumber.value
  sumOfMatrixRow(row)
}

const handlePutStartEvent = (row: number, index: number, event: DragEvent) => {
  updateValueOnPut(row, index)
  const img = document.createElement('img')
  event.dataTransfer?.setDragImage(img, 0, 0)
  // if (event.target instanceof HTMLInputElement && event.target.parentElement instanceof HTMLTableCellElement) {

  // }
}

const handlePutEvent = (row: number, index: number, event: DragEvent) => {
  updateValueOnPut(row, index)
  if (event.target instanceof HTMLInputElement && event.target.parentElement instanceof HTMLTableCellElement) {
    event.target.focus()
  }
}

const handleShiftDragStart = (row: number, col: number, event: DragEvent) => {
  if (!event.dataTransfer) return
  if (!event.target || !(event.target instanceof HTMLInputElement)) return
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData('row/col', row.toString() + col.toString())
}

const handleShiftDragOver = (event: DragEvent) => {
  if (!event.dataTransfer) return
  event.dataTransfer.dropEffect = "move"
}

const handleShiftDrop = (row: number, col: number, event: DragEvent) => {
  if (!event.dataTransfer) return
  if (!event.target || !(event.target instanceof HTMLInputElement)) return
  event.target.focus()
  const data = event.dataTransfer.getData('row/col')
  const numberToAdd = matrix.value[Number(data.substring(0, 1))][Number(data.substring(1))]
  //@ts-ignore
  matrix.value[Number(data.substring(0, 1))][Number(data.substring(1))] = ''
  const baseValue = matrix.value[row][col]
  const sumToAdd = Number(baseValue) + numberToAdd
  matrix.value[row][col] = sumToAdd
  sumOfMatrixRow(row)
  if (Number(data.substring(0, 1)) !== row) sumOfMatrixRow(Number(data.substring(0, 1)))
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
  if (putInput.value) putInput.value.focus()
}
const shiftMode = () => {
  activeButton.value = 3
  activeMode.value = 'shift'
}

</script>

<template>
  <div class="w-full min-h-max">
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
    <div class="w-full flex justify-center mt-4" :class="activeMode === 'put' ? '' : 'opacity-0'">
      <input type="text" class="bg-gray-200 rounded text-center py-1" v-model.number="putNumber" ref="putInput" />
    </div>
  </div>
  <div class="w-full flex justify-center py-10 text-center tracking-wide">
    <table>
      <thead>
        <tr class="cursor-default">
          <th
            v-for="(head, i) in tableHead"
            :key="head"
            class="border border-gray-400 py-2 font-normal border-b-black border-b-2"
            :class="[isSunday(i, 4) === '' ? isHoliday(i, 1) === '' ? 'bg-gray-100' : isHoliday(i, 1) : isSunday(i, 4), getHighlightState(0, i)]"
          >{{ head }}</th>
        </tr>
      </thead>
      <tbody>
        <tr class="cursor-default">
          <td
            v-for="(item, i) in firstRow"
            :key="item"
            class="border text-xs py-2 border-gray-400"
            :class="[isSunday(i, 4), isHoliday(i, 1), getHighlightState(1, i)]"
            @mouseenter="handleMouseEnterEvent(1, i)"
            @mouseleave="handleMouseLeaveEvent"
          >{{ item }}</td>
        </tr>
        <tr class="cursor-default">
          <td
            v-for="(item, i) in secondRow"
            :key="item"
            class="border text-xs border-gray-400 py-2 text-gray-400 font-thin"
            :class="[isSunday(i, 4), isHoliday(i, 1), getHighlightState(2, i)]"
            @mouseenter="handleMouseEnterEvent(2, i)"
            @mouseleave="handleMouseLeaveEvent"
          >{{ item }}</td>
        </tr>
        <tr>
          <td
            v-for="(item, i) in thirdRow"
            :key="item"
            class="border border-gray-400 border-b-black border-b-2 px-2"
            :class="getHighlightState(3, i)"
            @mouseenter="handleMouseEnterEvent(3, i)"
            @mouseleave="handleMouseLeaveEvent"
          >{{ item }}</td>
          <td
            v-for="(x, i) in matrix[0]"
            :key="i"
            class="border border-gray-400 border-b-black border-b-2"
            :class="[isSunday(i, 6), isHoliday(i, -1), getHighlightState(3, i + 2)]"
            @mouseenter="handleMouseEnterEvent(3, i + 2)"
            @mouseleave="handleMouseLeaveEvent"
          >
            <input
              type="text"
              :disabled="activeMode === 'read'"
              :readonly="activeMode === 'put' || activeMode === 'shift'"
              :draggable="activeMode === 'put' || (activeMode === 'shift' && Number(matrix[0][i]) > 0)"
              :dropzone="activeMode === 'put' || activeMode === 'shift'"
              class="w-10 text-center py-2 px-2"
              v-model.number="matrix[0][i]"
              :class="[isSunday(i, 6), isHoliday(i, -1), getHighlightState(3, i + 2), cursorPointer]"
              @change="sumOfMatrixRow(0)"
              @dragstart="activeMode === 'put' ? handlePutStartEvent(0, i, $event) : null, activeMode === 'shift' ? handleShiftDragStart(0, i, $event) : null"
              @dragover.prevent="activeMode === 'shift' ? handleShiftDragOver($event) : null"
              @drop="activeMode === 'shift' ? handleShiftDrop(0, i, $event) : null"
              @dragenter="activeMode === 'put' ? handlePutEvent(0, i, $event) : null, handleMouseEnterEvent(3, i + 2)"
              @dragleave="activeMode === 'put' ? handleMouseLeaveEvent : null"
              @click="activeMode === 'put' ? updateValueOnPut(0, i) : null"
            />
          </td>
          <td class="border border-gray-400 border-b-black border-b-2" :class="getHighlightState(3, 33)">
            <input
              :class="getHighlightState(3, 33)"
              type="text"
              disabled
              class="w-10 text-center py-2 px-2"
              :value="sumFirstMatrixRow"
              @mouseenter="handleMouseEnterEvent(3, 33)"
              @mouseleave="handleMouseLeaveEvent"
            />
          </td>
        </tr>
        <tr class="cursor-default">
          <td
            v-for="(item, i) in fourthRow"
            :key="item"
            class="border text-xs border-gray-400 py-2 text-gray-400 font-thin"
            :class="[isSunday(i, 4), isHoliday(i, 1), getHighlightState(4, i)]"
            @mouseenter="handleMouseEnterEvent(4, i)"
            @mouseleave="handleMouseLeaveEvent"
          >{{ item }}</td>
        </tr>
        <tr>
          <td
            v-for="(item, i) in fifthRow"
            :key="item"
            class="border border-gray-400 border-b-black border-b-2 px-2"
            :class="getHighlightState(5, i)"
            @mouseenter="handleMouseEnterEvent(5, i)"
            @mouseleave="handleMouseLeaveEvent"
          >{{ item }}</td>
          <td
            v-for="(x, i) in matrix[1]"
            :key="i"
            class="border border-gray-400 border-b-black border-b-2"
            :class="[isSunday(i, 6), isHoliday(i, -1), getHighlightState(5, i + 2)]"
            @mouseenter="handleMouseEnterEvent(5, i + 2)"
            @mouseleave="handleMouseLeaveEvent"
          >
            <input
              type="text"
              :disabled="activeMode === 'read'"
              :readonly="activeMode === 'put' || activeMode === 'shift'"
              :draggable="activeMode === 'put' || (activeMode === 'shift' && Number(matrix[1][i]) > 0)"
              :dropzone="activeMode === 'put' || activeMode === 'shift'"
              class="w-10 text-center py-2 px-2"
              v-model.number="matrix[1][i]"
              :class="[isSunday(i, 6), isHoliday(i, -1), getHighlightState(5, i + 2), cursorPointer]"
              @change="sumOfMatrixRow(1)"
              @dragover.prevent="activeMode === 'shift' ? handleShiftDragOver($event) : null"
              @drop="activeMode === 'shift' ? handleShiftDrop(1, i, $event) : null"
              @dragstart="activeMode === 'put' ? handlePutStartEvent(1, i, $event) : null, activeMode === 'shift' ? handleShiftDragStart(1, i, $event) : null"
              @dragenter="activeMode === 'put' ? handlePutEvent(1, i, $event) : null, handleMouseEnterEvent(5, i + 2)"
              @dragleave="activeMode === 'put' ? handleMouseLeaveEvent : null"
              @click="activeMode === 'put' ? updateValueOnPut(1, i) : null"
            />
          </td>
          <td class="border border-gray-400 border-b-black border-b-2" :class="getHighlightState(5, 33)">
            <input
              :class="getHighlightState(5, 33)"
              type="text"
              disabled
              class="w-10 text-center py-2 px-2"
              :value="sumSecondMatrixRow"
              @mouseenter="handleMouseEnterEvent(5, 33)"
              @mouseleave="handleMouseLeaveEvent"
            />
          </td>
        </tr>
        <tr class="cursor-default">
          <td
            v-for="(item, i) in sixthRow"
            :key="item"
            class="border text-xs text-gray-400 font-thin border-gray-400 py-2"
            :class="[isSunday(i, 4), isHoliday(i, 1), getHighlightState(6, i)]"
            @mouseenter="handleMouseEnterEvent(6, i)"
            @mouseleave="handleMouseLeaveEvent"
          >{{ item }}</td>
        </tr>
        <tr>
          <td
            v-for="(item, i) in seventhRow"
            :key="item"
            class="border border-gray-400 px-2"
            :class="getHighlightState(7, i)"
            @mouseenter="handleMouseEnterEvent(7, i)"
            @mouseleave="handleMouseLeaveEvent"
          >{{ item }}</td>
          <td
            v-for="(x, i) in matrix[2]"
            :key="i"
            class="border border-gray-400"
            :class="[isSunday(i, 6), isHoliday(i, -1), getHighlightState(7, i + 2)]"
            @mouseenter="handleMouseEnterEvent(7, i + 2)"
            @mouseleave="handleMouseLeaveEvent"
          >
            <input
              type="text"
              :disabled="activeMode === 'read'"
              :readonly="activeMode === 'put' || activeMode === 'shift'"
              :draggable="activeMode === 'put' || (activeMode === 'shift' && Number(matrix[2][i]) > 0)"
              :dropzone="activeMode === 'put' || activeMode === 'shift'"
              class="w-10 text-center py-2 px-2"
              v-model.number="matrix[2][i]"
              :class="[isSunday(i, 6), isHoliday(i, -1), getHighlightState(7, i + 2), cursorPointer]"
              @change="sumOfMatrixRow(2)"
              @dragover.prevent="activeMode === 'shift' ? handleShiftDragOver($event) : null"
              @drop="activeMode === 'shift' ? handleShiftDrop(2, i, $event) : null"
              @dragstart="activeMode === 'put' ? handlePutStartEvent(2, i, $event) : null, activeMode === 'shift' ? handleShiftDragStart(2, i, $event) : null"
              @dragenter="activeMode === 'put' ? handlePutEvent(2, i, $event) : null, handleMouseEnterEvent(7, i + 2)"
              @dragleave="activeMode === 'put' ? handleMouseLeaveEvent : null"
              @click="activeMode === 'put' ? updateValueOnPut(2, i) : null"
            />
          </td>
          <td class="border border-gray-400" :class="getHighlightState(7, 33)">
            <input
              :class="getHighlightState(7, 33)"
              type="text"
              disabled
              class="w-10 text-center py-2 px-2"
              :value="sumThirdMatrixRow"
              @mouseenter="handleMouseEnterEvent(7, 33)"
              @mouseleave="handleMouseLeaveEvent"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

 <!-- <input type="text" class="w-10 text-center" v-model.number="matrix[0][0]" /> -->