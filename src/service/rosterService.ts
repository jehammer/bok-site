import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { RosterError } from '../errors/errors';

class RosterService {
  private readonly baseUrl: string;
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    const configuredBaseUrl = import.meta.env.VITE_APP_BASE_URL ?? '';
    const apiVersion = import.meta.env.VITE_APP_VERSION ?? 'api';
    this.baseUrl = [configuredBaseUrl, apiVersion].filter(Boolean).join('/');

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl || '/',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const storedToken = localStorage.getItem('bokToken');
        if (storedToken && storedToken !== 'None') {
          config.headers.set('Authorization', `Bearer ${storedToken}`);
        }
        return config;
      },
      (error) => Promise.reject(error),
    );
  }

  private validateResponse(validation: AxiosResponse): boolean {
    return validation.status >= 200 && validation.status < 300;
  }

  public async getAllRosters(): Promise<any> {
    const response = await this.axiosInstance.get('/rosters/Roster-Viewer');
    if (this.validateResponse(response)) {
      return response.data.raids;
    }

    throw new RosterError(response.status, response.data.message ?? 'Unable to load rosters.');
  }

  public async updateExistingRoster(): Promise<void> {
    return;
  }

  public async getRankLimits(): Promise<string[]> {
    const response = await this.axiosInstance.get('/ranks');
    if (this.validateResponse(response)) {
      return response.data.ranks;
    }

    throw new RosterError(response.status, response.data.message ?? 'Unable to load rank limits.');
  }
}

const rosterService = new RosterService();

export { rosterService };
