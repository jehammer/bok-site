<template>
  <main class="rosters-page">
    <Navigation />

    <div class="grid nested-grid grid-nogutter container">
      <label for="roster-select">Select Roster</label>
      <div class="col-12 sm:col-12">
        <Select filter name="roster-select" id="roster-select" v-model="rosterSelector"
          :options=rosters placeholder="Select Roster" @change="loadRoster"/>
          <button @click="reloadOptions()" class="copy-button">
                  <font-awesome-icon :icon="['fas','rotate-right']" size="lg" style="color: #2f8a02" /> Reload Options
                </button>
      </div>
      <label for="leader">Select Time</label>
      <div class="col-12 sm:col-12 selector-container">
        <Select filter name="timezone-select" id="timezone-select" v-model="timezone"
          :options=timezones placeholder="Select a Timezone" class="timezone-picker" />
        <VueDatePicker class ="dp__theme_dark date-picker " :dark="true" v-model="date" :is-24="false" week-start="0" 
          :timezone="timezone" :text-input="textInputOptions" @update:model-value="generateTimestamp" />
      </div>
      <label for="rank-select">Set Limit</label>
      <div class="col-12 sm:col-12">
        <Select filter name="rank-select" id="rank-select" v-model="rankSelector"
          :options=ranks placeholder="Select Rank Limit"/>
      </div>
    </div>
    <div class="formgrid grid container">
        <div class="field col">
            <label for="trial">Trial</label>
            <input id="trial" v-model="trial" type="text" class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full">
        </div>
        <div class="field col">
            <label for="leader">Leader</label>
            <input id="leader" v-model="leader" type="text" class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full">
        </div>
    </div>
    <div class="formgrid grid container">
        <div class="field col">
            <label for="dps">Num DPS</label>
            <input id="dps" v-model="dps" type="text" class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full">
        </div>
        <div class="field col">
            <label for="healers">Num Healers</label>
            <input id="healers" v-model="healers" type="text" class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full">
        </div>
        <div class="field col">
            <label for="tanks">Num Tanks</label>
            <input id="tanks" v-model="tanks" type="text" class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full">
        </div>
    </div>
    <div class="formgrid grid container">
        <div class="field col-12">
            <label for="memo">Memo</label>
            <textarea id="memo" v-model="memo" type="text" rows="4" class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"></textarea>
        </div>
        <button @click="createNewRoster()" class="copy-button">Submit</button>
    </div>
  </main>
  </template>
  
  <script lang="ts">
  import '../css/rosters.css';
  import VueDatePicker from '@vuepic/vue-datepicker';
  import '@vuepic/vue-datepicker/dist/main.css';
  import { ref, onMounted } from 'vue';
  import { timeZonesNames} from "@vvo/tzdb";
  import Select from 'primevue/select';
  import Navigation from '../components/Navigation.vue';
  // @ts-ignore
  import { DateTime } from "luxon";
  import { notify } from "@kyvg/vue3-notification";
  import { rosterService } from '../service/rosterService';
  import { ExistingRaid, NewRaid } from '../models/raid';
import { RosterError } from '../errors/errors';

  export default {
    components: { VueDatePicker, Select, Navigation },
    setup() {
      const date = ref(new Date());
      const timezone = ref();
      const timezones = timeZonesNames;
      const generatedTimestamp = ref();
      const textInputOptions = {};
      const rosterSelector = ref();
      const rankSelector = ref();
      const ranks = ref();
      const rosters = ref();
      const leader = ref();
      const trial = ref();
      const dps = ref();
      const healers = ref();
      const tanks = ref();
      const memo = ref();
      const allRosters = ref();
      var submittable: boolean = true;

      const generateTimestamp = () => {
        const formatDate = new Date(date.value)
        const utcTimestamp = Math.floor((formatDate.getTime()) / 1000);
        generatedTimestamp.value = utcTimestamp;
      };

      const createNewRoster = () => {
        notify({ type: "info", title: 'Not Yet Ready', text: "This functionality is not yet ready! Come back later!" });
        if (submittable === false){
          return;
        }

        if (memo.value === ''){
          memo.value = 'None';
        }
        if (rosterSelector.value === rosters.value[0]){
          const newRaid: NewRaid = {
            data: {
              raid: trial.value,
              date: `${generatedTimestamp.value}`,
              leader: leader.value,
              dps_limit: dps.value,
              healer_limit: healers.value,
              tank_limit: tanks.value,
              role_limit: ranks.value.indexOf(rankSelector.value),
              memo: memo.value 
            }
          }
          console.log(newRaid)
        } else {
          const originalRaid: ExistingRaid = allRosters.value[(rosters.value.indexOf(rosterSelector.value))];
          const updatedRaid: ExistingRaid = {
            channelID: originalRaid.channelID,
            data: {
              raid: trial.value,
              date: `${generatedTimestamp.value}`,
              leader: leader.value,
              dps: originalRaid.data.dps,
              healers: originalRaid.data.healers,
              tanks: originalRaid.data.tanks,
              backup_dps: originalRaid.data.backup_dps,
              backup_healers: originalRaid.data.backup_healers,
              backup_tanks: originalRaid.data.backup_tanks,
              dps_limit: dps.value,
              healer_limit: healers.value,
              tank_limit: tanks.value,
              role_limit: ranks.value.indexOf(rankSelector.value),
              memo: memo.value
            }
          }
          console.log(updatedRaid);
        }

      }

      const loadRosterOptions = async () => {
        const storedToken = localStorage.getItem("bokToken");
        allRosters.value = []
        const blankRaid: NewRaid= {
          data: {
            raid: '',
            leader: '',
            date: `${generatedTimestamp.value}`,
            dps_limit: 8,
            healer_limit: 2,
            tank_limit: 2,
            role_limit: 0,
            memo: 'None',
          }
        }
        allRosters.value.push(blankRaid)
        if (storedToken === "None" || storedToken === null) {
          notify({ type: "error", title: 'No Token Set', text: "Please generate a token and set it in the Set Token button in the navbar menu." });
        } else {
          
          rosters.value = ["Create New"];
          let rosterList: ExistingRaid[]
          try{
            rosterList = await rosterService.getAllRosters();
          } catch (e) {
            if (e instanceof RosterError) {
              notify({type: "error", title: `${ e.code } Error`, text: e.message});
              return;
            }
            notify({type: "error", title: 'Hit Unknown Error', text: 'An unknown error occured, please reach out to Drak with the console error'});
            console.error(e);
            return;
          }

          for(let i: number = 0; i < rosterList.length; i++) {
            const roster: ExistingRaid = rosterList[i];
            const rosterTimestamp = roster.data.date;
            if (!rosterTimestamp) {
              console.log('No Timestamp found for current roster.');
              continue;
            }
            const rosterName = generateRosterName(Number(rosterTimestamp.match(/\d+/g)) | 0, roster.data.raid);
            rosters.value.push(rosterName)
            allRosters.value.push(roster)
          }
        }
        rosterSelector.value = rosters.value[0];
        rankSelector.value = ranks.value[0];
        
      }

      const loadRoster = () => {
        const roster: ExistingRaid = allRosters.value[(rosters.value.indexOf(rosterSelector.value))];
        leader.value = roster.data.leader,
        trial.value = roster.data.raid,
        dps.value = roster.data.dps_limit,
        healers.value = roster.data.healer_limit,
        tanks.value = roster.data.tank_limit,
        memo.value = roster.data.memo,
        date.value = new Date (Number(roster.data.date.match(/\d+/g)) * 1000),
        rankSelector.value = ranks.value[roster.data.role_limit]
      }

      const loadRanks = async ()  => {
        ranks.value = []
        const allRanks = await rosterService.getRankLimits();
        for (let i: number = 0; i < allRanks.length; i++){
          ranks.value.push(allRanks[i]);
        }
      }

      const generateRosterName = (timestamp: number, raid: string) => {
        // FORMAT: TRIAL-DAY_OF_WEEK-DAY_OF_MONTH
        const weekdays = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
        const date = new Date (timestamp * 1000)
        return `${ raid }-${ weekdays[date.getDay()] }-${ date.getDate() }${ getDaySuffix(date.getDate()) }`;
      }

      const getDaySuffix = (day: number) => {
        if (day >= 11 && day <= 13) {
            return 'th';
        }

        switch (day % 10) {
            case 1:
                return 'st';
            case 2:
                return 'nd';
            case 3:
                return 'rd';
            default:
                return 'th';
        }
      }


      const reloadOptions = async () => {
        await loadRanks();
        await loadRosterOptions();
      }
  
      onMounted(() => {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        timezone.value = userTimezone;
        generateTimestamp();
        dps.value = "8";
        healers.value="2";
        tanks.value="2";
        memo.value="None";
        reloadOptions()
      });
  
  
      return {
        date,
        timezones,
        timezone,
        generatedTimestamp,
        textInputOptions,
        rosterSelector,
        rankSelector,
        ranks,
        rosters,
        leader,
        trial,
        dps,
        healers,
        tanks,
        memo,
        submittable,
        allRosters,
        generateTimestamp,
        createNewRoster,
        loadRosterOptions,
        reloadOptions,
        generateRosterName,
        getDaySuffix,
        loadRoster,
        loadRanks
      }
    }
  }
  </script>