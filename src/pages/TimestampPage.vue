<template>
  <Navigation />
  <div class="container timestamp-page">
    <div class="col-12 sm:col-12 selector-container">
      <Select filter name="timezone-select" id="timezone-select" v-model="timezone"
        :options=timezones placeholder="Select a Timezone" class="timezone-picker" />
      <VueDatePicker class ="dp__theme_dark date-picker " :dark="true" v-model="date" :is-24="false" week-start="0" 
        :timezone="timezone" :text-input="textInputOptions" @update:model-value="generateTimestamp" />
    </div>
    <div>
      <div class="grid nested-grid">
        <div class="col-12" v-for="row in getRows()" :key="row.id" :formatted="row.formatted">       
          <div class="grid">
            <div class="xl:col-5 col-12">
              <div class="p-1 border-round-sm timestamp-field timestamp-code-field font-bold">
                <button @click="copyToClipboard(row.id)" class="timestamp-copy-button" aria-label="Copy timestamp">
                  <font-awesome-icon
                    :key="`${row.id}-${copyAnimationKeys[row.id] ?? 0}`"
                    :icon="['fas','clipboard']"
                    size="lg"
                    class="clipboard-icon"
                    :class="{ 'is-spinning': spinningCopyId === row.id }"
                  />
                </button>
                <span class="timestamp-value">{{ row.id }}</span>
              </div>
            </div>
            <div class="xl:col-6 col-12 m-2">
              <div class="p-1 border-round-sm timestamp-field font-bold m-0">
                {{ formatedDiscordTimestamps(row.formatted) }}
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  </div>
</template>

<script lang="ts">
import '../css/timestamp.css';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { onMounted, onUnmounted, ref } from 'vue';
import { timeZonesNames} from "@vvo/tzdb";
import Select from 'primevue/select';
import Navigation from '../components/Navigation.vue';

export default {
  components: { VueDatePicker, Select, Navigation },
  setup() {
    const date = ref(new Date());
    const timezone = ref();
    const copyAnimationKeys = ref<Record<string, number>>({});
    const spinningCopyId = ref<string>();
    const timezones = timeZonesNames;
    const generatedTimestamp = ref<number>(Math.floor(Date.now() / 1000));
    const currentTime = ref(Date.now());
    const textInputOptions = {};
    let clockInterval: number | undefined;
    const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'always' });

    const formatRelativeTimestamp = () => {
      const difference = (generatedTimestamp.value * 1000 - currentTime.value) / 1000;
      const absoluteDifference = Math.abs(difference);
      const units = [
        { unit: 'year' as const, seconds: 31_536_000 },
        { unit: 'month' as const, seconds: 2_592_000 },
        { unit: 'day' as const, seconds: 86_400 },
        { unit: 'hour' as const, seconds: 3_600 },
        { unit: 'minute' as const, seconds: 60 },
        { unit: 'second' as const, seconds: 1 },
      ];
      const unit = units.find(({ seconds }) => absoluteDifference >= seconds) ?? units[units.length - 1];
      const value = Math.round(difference / unit.seconds);

      return value === 0 ? 'now' : relativeTimeFormatter.format(value, unit.unit);
    };

    const getRows = () => {
      return [
        { id: `<t:${generatedTimestamp.value}:d>`,formatted: 'd' },
        { id: `<t:${generatedTimestamp.value}:D>`,formatted: 'D'  },
        { id: `<t:${generatedTimestamp.value}:t>`,formatted: 't'  },
        { id: `<t:${generatedTimestamp.value}:T>`,formatted: 'T'  },
        { id: `<t:${generatedTimestamp.value}:f>`,formatted: 'f'  },
        { id: `<t:${generatedTimestamp.value}:F>`,formatted: 'F'  },
        { id: `<t:${generatedTimestamp.value}:r>`,formatted: 'R'  },
        { id: `${generatedTimestamp.value}`, formatted: '0' },
      ]
    }

    const generateTimestamp = () => {
      const formatDate = new Date(date.value)
      const utcTimestamp = Math.floor((formatDate.getTime()) / 1000);
      generatedTimestamp.value = utcTimestamp;
    };

    const copyToClipboard = (value: string) => {
      spinningCopyId.value = value;
      copyAnimationKeys.value[value] = (copyAnimationKeys.value[value] ?? 0) + 1;
      navigator.clipboard.writeText(value);
    };

    const formatedDiscordTimestamps = (formatChoice: string) => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      const dateTime = new Date(generatedTimestamp.value * 1000);
      // dateTime.getHours() >= 12 ? 'PM' : 'AM'
      dateTime.getMinutes() < 10 ? '0' +  dateTime.getMinutes() : dateTime.getMinutes()

      switch(formatChoice){
        case 'd':
          return `${ dateTime.getMonth()+1 }/${ dateTime.getDate() }/${ dateTime.getFullYear() }`;
        case 'D':
          return `${ months[dateTime.getMonth()] } ${ dateTime.getDate() }, ${ dateTime.getFullYear() }`;
        case 't':
          return `${ dateTime.getHours() % 12 }:${ dateTime.getMinutes() < 10 ? '0' +  dateTime.getMinutes() : dateTime.getMinutes() }
           ${ dateTime.getHours() >= 12 ? 'PM' : 'AM' }`;
        case 'T':
          return `${ dateTime.getHours() % 12 }:${ dateTime.getMinutes() < 10 ? '0' +  dateTime.getMinutes() : dateTime.getMinutes() }:00 
          ${ dateTime.getHours() >= 12 ? 'PM' : 'AM' }`;
        case 'f':
          return `${ months[dateTime.getMonth()] } ${ dateTime.getDate() }, ${ dateTime.getFullYear() } 
          ${ dateTime.getHours() % 12 }:${ dateTime.getMinutes() < 10 ? '0' +  dateTime.getMinutes() : dateTime.getMinutes()}`;
        case 'F':
          return `${ weekdays[dateTime.getDay()] }, ${ months[dateTime.getMonth()] } ${ dateTime.getDate() }, ${ dateTime.getFullYear() } 
          ${ dateTime.getHours() % 12 }:${ dateTime.getMinutes() < 10 ? '0' +  dateTime.getMinutes() : dateTime.getMinutes() }`;
        case 'R':
          return formatRelativeTimestamp();
        case '0':
          return generatedTimestamp.value;
      }
    }

    onMounted(() => {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      timezone.value = userTimezone;
      generateTimestamp();
      currentTime.value = Date.now();
      clockInterval = window.setInterval(() => {
        currentTime.value = Date.now();
      }, 1000);
    });

    onUnmounted(() => {
      if (clockInterval !== undefined) {
        window.clearInterval(clockInterval);
      }
    });

    return {
      date,
      timezones,
      timezone,
      copyAnimationKeys,
      spinningCopyId,
      generatedTimestamp,
      textInputOptions,
      generateTimestamp,
      copyToClipboard,
      getRows,
      formatedDiscordTimestamps
    }
  }
}
</script>
