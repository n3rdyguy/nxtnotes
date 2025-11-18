<script setup lang="ts">
import Swal from "sweetalert2";

definePageMeta({
  middleware: ["auth"],
});
interface Note {
  id: number
  text: string
  updated_at: string
}
const noteTextarea = ref<HTMLTextAreaElement | null>(null);
const notes = ref<Note[]>([]);
const selectedNote = ref<Note | null>(null);
const updatedNote = ref("");
const todaysNotes = computed(() => {
  return notes.value.filter((note) => {
    const noteDate = new Date(note.updated_at);
    return noteDate.toDateString() === new Date().toDateString();
  });
});
const yesterdaysNotes = computed(() => {
  return notes.value.filter((note) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const noteDate = new Date(note.updated_at);
    return noteDate.toDateString() === yesterday.toDateString();
  });
});
const earlierNotes = computed(() => {
  return notes.value.filter((note) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const noteDate = new Date(note.updated_at);
    return noteDate.toDateString() < yesterday.toDateString();
  });
});
async function updateNote() {
  if (!selectedNote.value) {
    return;
  }
  try {
    await $fetch(`/api/notes/${selectedNote.value.id}`, {
      method: "PATCH",
      body: {
        updatedNote: updatedNote.value.slice(0, 65535),
      },
    });
    selectedNote.value.text = updatedNote.value;
  }
  catch (error: any) {
    throw createError({
      statusCode: Number(error.statusCode) || 500,
      statusMessage: String(error.message),
    });
  }
}
const debouncedUpdateNote = useDebounceFn(async () => {
  await updateNote();
  // console.log("Note updated: ", selectedNote.value?.id);
}, 500);
function selectNote(note: Note) {
  selectedNote.value = note;
  updatedNote.value = note.text;
}
async function createNewNote() {
  try {
    const newNote = await $fetch<Note>("/api/notes", {
      method: "POST",
    });
    notes.value.unshift(newNote);
    selectedNote.value = newNote;
    updatedNote.value = "";
  }
  catch (error: any) {
    throw createError({
      statusCode: Number(error.statusCode) || 500,
      statusMessage: String(error.message),
    });
  }
}
async function deleteNote() {
  if (!selectedNote.value) {
    return;
  }

  try {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: "Delete Note?",
      text: "Are you sure you want to delete this note? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FFAC00",
      cancelButtonColor: "#6D6D73",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    // If user cancels, exit early
    if (!result.isConfirmed) {
      return;
    }

    // Proceed with deletion
    const deletedNote = await $fetch<Note>(`/api/notes/${selectedNote.value.id}`, {
      method: "DELETE",
    });

    // Remove note from array
    notes.value = notes.value.filter(note => note.id !== deletedNote.id);

    // Auto-select the first note (most recent) or create new one if none remain
    if (notes.value.length > 0) {
      selectedNote.value = notes.value[0];
      updatedNote.value = selectedNote.value.text;
    }
    else {
      await createNewNote();
    }

    // Show success message
    await Swal.fire({
      title: "Deleted!",
      text: "Your note has been deleted.",
      icon: "success",
      confirmButtonColor: "#FFAC00",
      timer: 2000,
      showConfirmButton: false,
    });
  }
  catch (error: any) {
    Swal.fire({
      title: "Error!",
      text: error.message || "Failed to delete note",
      icon: "error",
      confirmButtonColor: "#FFAC00",
    });
  }
}

// Throttled version to prevent rapid successive deletions
const throttledDeleteNote = useThrottleFn(deleteNote, 2000);
function logout() {
  useCookie("accessToken").value = null;
  useCookie("refreshToken").value = null;
  return navigateTo("/login");
}
onMounted(async () => {
  notes.value = await $fetch<Note[]>("/api/notes");

  if (notes.value.length > 0) {
    selectedNote.value = notes.value[0];
    updatedNote.value = selectedNote.value.text;
  }
  else {
    await createNewNote();
    selectedNote.value = notes.value[0];
  }
  nextTick(() => {
    noteTextarea.value?.focus();
  });
  watch(updatedNote, () => {
    nextTick(() => {
      noteTextarea.value?.focus();
    });
  });
});
</script>

<template>
  <div class="flex bg-zinc-900 min-h-screen">
    <!-- sidebar -->
    <div class="bg-black w-[338px] p-8 flex flex-col h-screen overflow-y-auto scrollbar">
      <div><Logo /></div>
      <!-- today container -->
      <div>
        <p class="text-sm font-bold text-[#C2C2C5] mb-6 mt-12">
          Today
        </p>
        <div
          class="ml-2 space-y-2"
        >
          <div
            v-for="note in todaysNotes" :key="note.id" class="p-2 rounded-lg cursor-pointer"
            :class="{ 'bg-[#A1842C]': selectedNote?.id === note.id,
                      'hover:bg-[#A1842C]/50': selectedNote?.id !== note.id,
            }"
            @click="selectNote(note)"
          >
            <h3 class="text-sm font-bold text-[#F4F4F5] truncate">
              {{ note.text.substring(0, 40) }}
            </h3>
            <div class="leading-none text-[#C2C2C5] truncate">
              <span class="text-xs text-[#F4F4F5] mr-4">
                {{ new Date().toLocaleDateString() }}
              </span>
              <span v-if="note.text.length > 40" class="text-xs text-[#C2C2C5]">...{{ note.text.substring(40, 90) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- /today container -->
      <!-- yesterday container -->
      <div>
        <p class="text-sm font-bold text-[#C2C2C5] mb-6 mt-12">
          Yesterday
        </p>
        <div
          class="ml-2 space-y-2"
        >
          <div
            v-for="note in yesterdaysNotes" :key="note.id" class="p-2 rounded-lg cursor-pointer"
            :class="{ 'bg-[#A1842C]': selectedNote?.id === note.id,
                      'hover:bg-[#A1842C]/50': selectedNote?.id !== note.id,
            }"
            @click="selectNote(note)"
          >
            <h3 class="text-sm font-bold text-[#F4F4F5] truncate">
              {{ note.text.substring(0, 40) }}
            </h3>
            <div class="leading-none text-[#C2C2C5] truncate">
              <span class="text-xs text-[#F4F4F5] mr-4">
                {{ new Date(note.updated_at).toLocaleDateString() }}
              </span>
              <span v-if="note.text.length > 40" class="text-xs text-[#C2C2C5]">...{{ note.text.substring(40, 90) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- /yesterday container -->
      <!-- past 30 days container -->
      <div>
        <p class="text-sm font-bold text-[#C2C2C5] mb-6 mt-12">
          Earlier
        </p>
        <div
          class="ml-2 space-y-2"
        >
          <div
            v-for="note in earlierNotes" :key="note.id" class="p-2 rounded-lg cursor-pointer"
            :class="{ 'bg-[#A1842C]': selectedNote?.id === note.id,
                      'hover:bg-[#A1842C]/50': selectedNote?.id !== note.id,
            }"
            @click="selectNote(note)"
          >
            <h3 class="text-sm font-bold text-[#F4F4F5] truncate">
              {{ note.text.substring(0, 40) }}
            </h3>
            <div class="leading-none text-[#C2C2C5] truncate">
              <span class="text-xs text-[#F4F4F5] mr-4">
                {{ new Date(note.updated_at).toLocaleDateString() }}
              </span>
              <span class="text-xs text-[#C2C2C5]">...{{ note.text.substring(40, 90) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- /past 30 days container -->
    </div>
    <!-- /sidebar -->
    <!-- button container -->
    <div class="w-full flex flex-col">
      <div class="flex justify-between w-full items-start p-8">
        <button
          class="inline-flex text-sx text-[#C2C2C5] hover:text-white items-center gap-2"
          @click="createNewNote"
        >
          <PencilIcon />
          Create note
        </button>
        <button class="text-[#6D6D73] hover:text-white" @click="throttledDeleteNote">
          <TrashIcon />
        </button>
      </div>
      <!-- /button container -->
      <!-- note container -->
      <div class="max-w-[437px] mx-auto w-full flex-grow flex flex-col">
        <p class="text-[#929292] playfair">
          {{ selectedNote?.updated_at ? new Date(selectedNote.updated_at).toLocaleDateString() : new Date().toLocaleDateString() }}
        </p>
        <textarea
          id="note"
          ref="noteTextarea"
          v-model="updatedNote" maxlength="65535" name="note"
          class="text-[#D4D4D4] my-4 playfair note scrollbar w-full bg-transparent focus:outline-none resize-none flex-grow"
          @input="debouncedUpdateNote"
        />
      </div>
      <button class="text-zinc-400 hover:text-white text-sm font-bold absolute right-5 bottom-5" @click="logout">
        Log Out
      </button>
    </div>
    <!-- /note container -->
  </div>
</template>

<style scoped>
.note {
  white-space: pre-line; /* Preserves newlines, collapses multiple spaces */
}
.scrollbar::-webkit-scrollbar {
  width: 6px; /* Slimmer width */
}

.scrollbar::-webkit-scrollbar-track {
  background: #333; /* Dark track */
}

.scrollbar::-webkit-scrollbar-thumb {
  background: #555; /* Darker thumb */
  border-radius: 3px;
}

.scrollbar::-webkit-scrollbar-thumb:hover {
  background: #666; /* Even darker on hover */
}
</style>
