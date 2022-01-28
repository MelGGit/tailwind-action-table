<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import ChevronLeft from '~icons/carbon/chevron-left'
import ChevronRight from '~icons/carbon/chevron-right'
import DocumentIcon from '~icons/ion/document-text-sharp'
import PrintIcon from '~icons/fa-solid/print'
import TrashIcon from '~icons/bi/trash-fill'
import LineIcon from '~icons/ci/line-l'
import PuzzleIcon from '~icons/fa-solid/puzzle-piece'
import PlusIcon from '~icons/jam/plus-circle-f'
import ProfileIcon from '~icons/healthicons/ui-user-profile'
import TriLinesIcon from '~icons/el/lines'
import TriPointsIcon from '~icons/fluent/more-vertical-32-filled'
import Logo from '~icons/tabler/box-multiple'
import EyeIcon from '~icons/fa-regular/eye'
import KeyboardIcon from '~icons/carbon/keyboard'
import PointerIcon from '~icons/clarity/cursor-hand-solid'
import OmniDirecIcon from '~icons/bx/bx-move'
import CornerLowerRightIcon from '~icons/vaadin/corner-lower-right'


type modeEnum = 'read' | 'enter' | 'put' | 'shift' | 'attribute'
type weekdayShortsEnum = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa' | 'So'
const numberOfDaysInMonth = 31
const rows = 3

const putNumber = ref<number>(1)
const activeButton = ref<number>(0)
const activeMode = ref<modeEnum>('read')
const matrix = ref<number[][]>(createValueMatrix(rows, numberOfDaysInMonth))
const attributeMatrix = reactive<Set<string>[][]>(createAttributeMatrix(rows, numberOfDaysInMonth))
const sumFirstMatrixRow = ref<number>(31)
const sumSecondMatrixRow = ref<number>(31)
const sumThirdMatrixRow = ref<number>(31)
const mouseEventRow = ref<number>(-1)
const mouseEventCol = ref<number>(-1)
const putInput = ref<HTMLInputElement>()
const modal = ref<HTMLDivElement>()
const showModal = ref<boolean>(false)
const modalValues = ref<string[]>()
const addAttribute = ref<string>('')

const attributeList = ['Merkmal 1', 'Merkmal 2', 'Merkmal 3', 'Merkmal 4']
const tableHead = ['Vertrag', 'Leistung', ...Array.from(Array(numberOfDaysInMonth), (e, i) => i + 1), 'A']
const firstRow = ['', 'Pflegeversicherung', ...createWeeKArray(5, numberOfDaysInMonth), '']
const secondRow = ['', 'morgens', ...Array.from(Array(numberOfDaysInMonth), (e, i) => i + 1), '']
const thirdRow = ['SGB XI HH', 'LK1: KL Morgen/Abendtlt.']
const fourthRow = ['', 'vormittags', ...Array.from(Array(numberOfDaysInMonth), (e, i) => i + 1), '']
const fifthRow = ['SGB XI HH', 'LK5: Lagern/Betten']
const sixthRow = ['', 'mittags', ...Array.from(Array(numberOfDaysInMonth), (e, i) => i + 1), '']
const seventhRow = ['SGB XI HH', 'LK17: Kl. Besorgungen']

const cursorPointer = computed(() => activeMode.value === 'put' || activeMode.value === 'shift' ? 'cursor-pointer' : '')
const attributeModeCursor = computed(() => activeMode.value === 'attribute' && addAttribute.value.length > 0 ? 'cursor-pointer' : 'cursor-default')

function createValueMatrix(rows: number, columns: number): number[][] {
  return Array.from(Array(rows), () => new Array(columns).fill(1))
}
function createAttributeMatrix(rows: number, columns: number): Set<string>[][] {
  return Array.from(Array(rows), () => Array.from(Array(columns), () => new Set())
  )
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

const handleShowModal = (row: number, col: number, event: MouseEvent) => {
  if (!event.target || !(event.target instanceof HTMLTableCellElement)) return
  modalValues.value = [...attributeMatrix[row][col]]
  const { left, bottom } = event.target.getBoundingClientRect()
  if (!modal.value) return
  modal.value.style.top = (bottom + 2).toString() + 'px'
  modal.value.style.left = left.toString() + 'px'
  showModal.value = true
}

const handleAddAttribute = (row: number, col: number) => {
  attributeMatrix[row][col].add(addAttribute.value)
}

const closeModal = () => {
  showModal.value = false
  modalValues.value = []
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
const attributeMode = () => {
  activeButton.value = 4
  activeMode.value = 'attribute'
}

const addItem = () => {
  attributeMatrix[0][30].add('test')
  attributeMatrix[0][30].add('test2')
  attributeMatrix[0][30].add('test3')
  attributeMatrix[0][30].add('test4')
  attributeMatrix[1][0].add('test')
  attributeMatrix[1][0].add('test2')
  attributeMatrix[2][10].add('test')
  attributeMatrix[2][10].add('test2')
  attributeMatrix[1][6].add('test')
  attributeMatrix[2][6].add('test2')
}

</script>

<template>
  <div class="w-full h-screen px-10 py-5 test overflow-hidden relative">
    <div
      class="flex flex-col absolute bg-bg-accent border-black z-10 px-2 py-1 border text-sm shadow-lg"
      ref="modal"
      :class="showModal ? 'block' : 'hidden', modalValues && modalValues.length < 2 ? 'rounded-md' : 'rounded-lg'"
    >
      <span v-for="value in modalValues" :key="value">{{ value }}</span>
    </div>
    <div class="flex justify-between items-center mb-4 text-white">
      <div class="flex items-center gap-10 text-lg">
        <Logo width="50" height="50" />
        <span v-if="attributeMatrix[0][1].size > 0">Has Entries</span>
        <button @click="addItem">Add</button>
        <span>Dashboard</span>
        <span>Patienten</span>
        <span>Mitarbeiter</span>
        <button class="bg-button-darker-blue px-4 py-2 rounded-xl">Abrechnung</button>
      </div>
      <TriPointsIcon width="30" height="30" class="mr-[-10px]" />
    </div>
    <div class="w-full border-b border-b-gray-600 mb-4"></div>
    <div class="w-full flex justify-between items-center text-white mb-16">
      <div class="flex items-center text-2xl gap-4">
        <ProfileIcon width="40" height="40" />Klaus Klausen
        <TriLinesIcon width="15" height="15" />
      </div>
      <h2 class="text-3xl tracking-wide">Leistungsnachweis</h2>
      <div class="flex items-center gap-1 font-thin text-sm">
        <span>Abrechnung</span>
        <ChevronRight width="15" height="15" />
        <span>Leistungsnachweis</span>
      </div>
    </div>
    <div class="w-full px-10 py-10 h-[75%] bg-white rounded-xl relative shadow-xl">
      <div class="w-full min-h-max">
        <div class="w-full flex justify-center absolute top-[-2rem] left-0">
          <div class="flex justify-center border-black border rounded-xl overflow-hidden shadow-2xl">
            <button
              :disabled="activeButton === 0"
              :class="activeButton === 0 ? 'bg-dark-blue text-white' : 'bg-bg-accent'"
              class="px-4 py-2 flex flex-col justify-center items-center"
              @click="readMode"
            >
              <EyeIcon />Lesen
            </button>
            <button
              :disabled="activeButton === 1"
              :class="activeButton === 1 ? 'bg-dark-blue text-white' : 'bg-bg-accent'"
              class="px-4 py-2 flex flex-col justify-center items-center"
              @click="enterMode"
            >
              <KeyboardIcon />Eingabe
            </button>
            <button
              :disabled="activeButton === 2"
              :class="activeButton === 2 ? 'bg-dark-blue text-white' : 'bg-bg-accent'"
              class="px-4 py-2 flex flex-col justify-center items-center"
              @click="putMode"
            >
              <PointerIcon />Setzen
            </button>
            <button
              :disabled="activeButton === 3"
              :class="activeButton === 3 ? 'bg-dark-blue text-white' : 'bg-bg-accent'"
              class="px-4 py-2 flex flex-col justify-center items-center"
              @click="shiftMode"
            >
              <OmniDirecIcon />Verschieben
            </button>
          </div>
        </div>
        <div class="w-full flex justify-center mt-4" :class="activeMode === 'put' ? '' : 'opacity-0'">
          <input type="text" class="bg-gray-200 rounded text-center py-1" v-model.number="putNumber" ref="putInput" />
        </div>
      </div>
      <div class="w-full flex justify-between items-center mb-6">
        <div class="flex items-center text-xl tracking-wide">
          <ChevronLeft width="30" height="30" />Januar 2022
          <ChevronRight width="30" height="30" />
        </div>
        <div class="flex items-center gap-4">
          <DocumentIcon width="30" height="30" />
          <PrintIcon width="30" height="30" />
          <TrashIcon width="30" height="30" />
          <LineIcon width="30" height="30" />
          <button @click="attributeMode" class="relative">
            <select
              name="attribute"
              v-model="addAttribute"
              v-if="activeMode === 'attribute'"
              class="absolute top-8 left-[-30px] text-sm font-thin"
            >
              <option :key="attribute" :value="attribute" v-for="attribute in attributeList">{{ attribute }}</option>
            </select>
            <PuzzleIcon width="30" height="30" />
          </button>
          <PlusIcon width="30" height="30" />
        </div>
      </div>
      <div class="w-full flex justify-center text-center tracking-wide">
        <table class="w-full border-collapse">
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
                @mouseenter="[handleMouseEnterEvent(2, i), i > 1 && i < 33 && attributeMatrix[0][i - 2].size > 0 ? handleShowModal(0, i - 2, $event) : null]"
                @mouseleave="[handleMouseLeaveEvent(), closeModal()]"
              >
                <div class="relative">
                  {{ item }}
                  <CornerLowerRightIcon
                    width="7"
                    height="7"
                    class="absolute right-0 bottom-[-7px]"
                    v-if="i > 1 && i < 33 && attributeMatrix[0][i - 2].size > 0"
                  />
                </div>
              </td>
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
                  :readonly="activeMode === 'put' || activeMode === 'shift' || activeMode === 'attribute'"
                  :draggable="activeMode === 'put' || (activeMode === 'shift' && Number(matrix[0][i]) > 0)"
                  :dropzone="activeMode === 'put' || activeMode === 'shift'"
                  class="w-10 text-center py-2 px-2"
                  v-model.number="matrix[0][i]"
                  :class="[isSunday(i, 6), isHoliday(i, -1), getHighlightState(3, i + 2), cursorPointer, attributeModeCursor]"
                  @change="sumOfMatrixRow(0)"
                  @dragstart="activeMode === 'put' ? handlePutStartEvent(0, i, $event) : null, activeMode === 'shift' ? handleShiftDragStart(0, i, $event) : null"
                  @dragover.prevent="activeMode === 'shift' ? handleShiftDragOver($event) : null"
                  @drop="activeMode === 'shift' ? handleShiftDrop(0, i, $event) : null"
                  @dragenter="activeMode === 'put' ? handlePutEvent(0, i, $event) : null, handleMouseEnterEvent(3, i + 2)"
                  @dragleave="activeMode === 'put' ? handleMouseLeaveEvent : null"
                  @click="[activeMode === 'put' ? updateValueOnPut(0, i) : null, activeMode === 'attribute' && addAttribute.length > 0 ? handleAddAttribute(0, i) : null]"
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
                @mouseenter="[handleMouseEnterEvent(4, i), i > 1 && i < 33 && attributeMatrix[1][i - 2].size > 0 ? handleShowModal(1, i - 2, $event) : null]"
                @mouseleave="[handleMouseLeaveEvent(), closeModal()]"
              >
                <div class="relative">
                  {{ item }}
                  <CornerLowerRightIcon
                    width="7"
                    height="7"
                    class="absolute right-0 bottom-[-7px]"
                    v-if="i > 1 && i < 33 && attributeMatrix[1][i - 2].size > 0"
                  />
                </div>
              </td>
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
                  :readonly="activeMode === 'put' || activeMode === 'shift' || activeMode === 'attribute'"
                  :draggable="activeMode === 'put' || (activeMode === 'shift' && Number(matrix[1][i]) > 0)"
                  :dropzone="activeMode === 'put' || activeMode === 'shift'"
                  class="w-10 text-center py-2 px-2"
                  v-model.number="matrix[1][i]"
                  :class="[isSunday(i, 6), isHoliday(i, -1), getHighlightState(5, i + 2), cursorPointer, attributeModeCursor]"
                  @change="sumOfMatrixRow(1)"
                  @dragover.prevent="activeMode === 'shift' ? handleShiftDragOver($event) : null"
                  @drop="activeMode === 'shift' ? handleShiftDrop(1, i, $event) : null"
                  @dragstart="activeMode === 'put' ? handlePutStartEvent(1, i, $event) : null, activeMode === 'shift' ? handleShiftDragStart(1, i, $event) : null"
                  @dragenter="activeMode === 'put' ? handlePutEvent(1, i, $event) : null, handleMouseEnterEvent(5, i + 2)"
                  @dragleave="activeMode === 'put' ? handleMouseLeaveEvent : null"
                  @click="[activeMode === 'put' ? updateValueOnPut(1, i) : null, activeMode === 'attribute' && addAttribute.length > 0 ? handleAddAttribute(1, i) : null]"
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
                @mouseenter="[handleMouseEnterEvent(6, i), , i > 1 && i < 33 && attributeMatrix[2][i - 2].size > 0 ? handleShowModal(2, i - 2, $event) : null]"
                @mouseleave="[handleMouseLeaveEvent(), closeModal()]"
              >
                <div class="relative">
                  {{ item }}
                  <CornerLowerRightIcon
                    width="7"
                    height="7"
                    class="absolute right-0 bottom-[-7px]"
                    v-if="i > 1 && i < 33 && attributeMatrix[2][i - 2].size > 0"
                  />
                </div>
              </td>
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
                  :readonly="activeMode === 'put' || activeMode === 'shift' || activeMode === 'attribute'"
                  :draggable="activeMode === 'put' || (activeMode === 'shift' && Number(matrix[2][i]) > 0)"
                  :dropzone="activeMode === 'put' || activeMode === 'shift'"
                  class="w-10 text-center py-2 px-2"
                  v-model.number="matrix[2][i]"
                  :class="[isSunday(i, 6), isHoliday(i, -1), getHighlightState(7, i + 2), cursorPointer, attributeModeCursor]"
                  @change="sumOfMatrixRow(2)"
                  @dragover.prevent="activeMode === 'shift' ? handleShiftDragOver($event) : null"
                  @drop="activeMode === 'shift' ? handleShiftDrop(2, i, $event) : null"
                  @dragstart="activeMode === 'put' ? handlePutStartEvent(2, i, $event) : null, activeMode === 'shift' ? handleShiftDragStart(2, i, $event) : null"
                  @dragenter="activeMode === 'put' ? handlePutEvent(2, i, $event) : null, handleMouseEnterEvent(7, i + 2)"
                  @dragleave="activeMode === 'put' ? handleMouseLeaveEvent : null"
                  @click="[activeMode === 'put' ? updateValueOnPut(2, i) : null, activeMode === 'attribute' && addAttribute.length > 0 ? handleAddAttribute(2, i) : null]"
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
    </div>
    <div class="w-full flex justify-end items-end mt-8 text-sm opacity-40 gap-4">
      <span>Datenschutz</span>
      •
      <span>Impressum</span>
    </div>
  </div>
</template>

<style>
.test {
  background: linear-gradient(
    to bottom,
    #1d2230 0%,
    #1d2230 38%,
    white 38%,
    white 100%
  );
}
</style>