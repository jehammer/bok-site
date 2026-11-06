<template>
  <main class="advanced-rosters-page">
  <Navigation />
  <div class="col-12 actions-row"> 
    <button @click="showJsonModal = true" class="copy-button">Load Data</button>
  </div>
  <div class="grid nested-grid grid-nogutter container">
    <label for="leader">Select Time</label>
    <div class="col-12 sm:col-12 selector-container">
      <Select filter name="timezone-select" id="timezone-select" v-model="timezone"
        :options="timezones" placeholder="Select a Timezone" class="timezone-picker" />

      <VueDatePicker
        class="dp__theme_dark date-picker"
        :dark="true"
        v-model="date"
        :is-24="false"
        week-start="0"
        :timezone="timezone"
        :text-input="textInputOptions"
        @update:model-value="generateTimestamp"
      />
    </div>

    <div class="field col">
      <label for="trial">Trial</label>
      <input id="trial" v-model="trial" type="text"
        class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full" />
    </div>

    <div class="field col">
      <label for="leader">Leader</label>
      <input id="leader" v-model="leader" type="text"
        class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full" />
    </div>

<div class="field col">
  <label for="tier">Tier</label>
  <select id="tier" v-model="tier"
    class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round w-full role-select">
    <option value=0>Everyone</option>
    <option value=1>T1</option>
    <option value=2>T2</option>
    <option value=3>T3</option>
  </select>
</div>
  </div>
  <div class="formgrid grid container">
    <div class="col-12">
      <h3>Slot Editor</h3>

      <table class="slots-table">
        <thead>
          <tr>
            <th style="width:48px">#</th>
            <th style="width:120px">Role</th>
            <th>Title</th>
            <th>Memo</th>
            <th style="width:72px"></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(slot) in slots" :key="slot.index">
            <td class="center">{{ slot.index }}</td>
            <td class="center">
                <select v-model="slot.role" class="role-select">
                    <option value="tank">Tank</option>
                    <option value="healer">Healer</option>
                    <option value="dps">DPS</option>
                </select>
            </td>

            <td>
              <input v-model="slot.title" type="text"
                class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round w-full" />
            </td>

            <td>
              <textarea v-model="slot.memo" rows="2"
                class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round w-full"></textarea>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="formgrid grid container">
    <div class="field col-12">
      <label for="memo">Memo</label>
      <textarea id="memo" v-model="memo" rows="4"
        class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round w-full"></textarea>
    </div>

    <div class="col-12 actions-row">
      <button @click="copySlotJson" class="copy-button">Copy Data</button>
    </div>
  </div>

<transition name="modal-fade">
  <div v-if="showJsonModal" class="modal-backdrop">
    <div class="modal-content">
      <h3>Paste Data to Load</h3>
      <textarea v-model="jsonInput" rows="8"
        placeholder="Paste Data here!"
        class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round w-full"></textarea>
      <div class="modal-actions">
        <button @click="loadFromJson" class="copy-button">Load</button>
        <button @click="showJsonModal = false" class="copy-button">Cancel</button>
      </div>
    </div>
  </div>
</transition>

  </main>
</template>

<script lang="ts">
import '../css/advanced-rosters.css';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { ref, onMounted } from 'vue';
import { timeZonesNames } from "@vvo/tzdb";
import Select from 'primevue/select';
import Navigation from '../components/Navigation.vue';
import { notify } from "@kyvg/vue3-notification";

type Slot = {
  index: number;
  role: 'tank' | 'healer' | 'dps';
  title: string;
  memo: string;
};

export default {
  components: { VueDatePicker, Select, Navigation },
  setup() {
    const date = ref(new Date());
    const timezone = ref<string | undefined>();
    const timezones = timeZonesNames;
    const generatedTimestamp = ref<number | null>(null);
    const textInputOptions = {};
    const rankSelector = ref();
    const ranks = ref<string[]>([]);
    const leader = ref('');
    const trial = ref('');
    const memo = ref('');
    const tier = ref('');
    const showJsonModal = ref(false);
    const jsonInput = ref('');
    const slots = ref<Slot[]>([]);

    const createDefaultSlots = () => {
      const defaultSlots: Slot[] = [];
      let idx = 1;

      const pushRole = (count: number, role: Slot['role'], baseTitle: string) => {
        for (let i = 0; i < count; i++, idx++) {
          defaultSlots.push({
            index: idx,
            role,
            title: i === 0 ? baseTitle : `${baseTitle} ${i + 1}`,
            memo: ''
          });
        }
      };

      pushRole(2, 'tank', 'Tank');
      pushRole(2, 'healer', 'Healer');
      pushRole(8, 'dps', 'DPS');

      slots.value = defaultSlots;
    };

    const generateTimestamp = () => {
      const dt = new Date(date.value);
      if (isNaN(dt.getTime())) {
        generatedTimestamp.value = null;
        return;
      }
      const utcTimestamp = Math.floor(dt.getTime() / 1000);
      generatedTimestamp.value = utcTimestamp;
    };

    const copySlotJson = () => {
      const jsonObj: any = {
        raid: trial.value,
        leader: leader.value,
        date: generatedTimestamp.value ?? Math.floor((new Date()).getTime() / 1000),
        role_limit: parseInt(tier.value),
        memo: memo.value,
        slots: slots.value.map(s => ({
          index: s.index,
          role: s.role,
          title: s.title,
          memo: s.memo
        }))
      };

      try {
        navigator.clipboard.writeText(JSON.stringify(jsonObj, null, 2));
        notify({ type: "success", title: "Copied", text: "Data copied to clipboard." });
      } catch (e) {
        console.error("Clipboard failed", e);
        notify({ type: "error", title: "Copy Failed", text: "Could not copy to clipboard." });
      }
    };

    const loadFromJson = () => {
    if (!jsonInput.value) {
        notify({ type: "error", title: "Empty Data", text: "Please paste valid Data." });
        return;
    }

    try {
        const parsed = JSON.parse(jsonInput.value);

        trial.value = parsed.raid ?? '';
        leader.value = parsed.leader ?? '';
        memo.value = parsed.memo ?? '';
        tier.value = parsed.role_limit.toString() ?? '';

        if (parsed.date) {
        const dt = new Date(parsed.date * 1000);
        date.value = dt;
        generateTimestamp();
        }

        if (Array.isArray(parsed.slots)) {
        slots.value = parsed.slots.map((s: any, i: number) => ({
            index: i + 1,
            role: s.role ?? 'dps',
            title: s.title ?? '',
            memo: s.memo ?? ''
        }));
        }

        notify({ type: "success", title: "Loaded", text: "Data loaded." });
        showJsonModal.value = false;
    } catch (e) {
        console.error(e);
        notify({ type: "error", title: "Invalid Data", text: "Failed to parse Data." });
    }
    };

    onMounted(() => {
      timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
      generateTimestamp();

      createDefaultSlots();
    });

    return {
      date,
      timezone,
      timezones,
      generatedTimestamp,
      textInputOptions,
      rankSelector,
      ranks,
      leader,
      trial,
      memo,
      tier,
      slots,
      jsonInput,
      showJsonModal,
      createDefaultSlots,
      generateTimestamp,
      copySlotJson,
      loadFromJson
    };
  }
};
</script>
