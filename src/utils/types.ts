import { ProcessedEEGPoint } from "./dataProcessing";

export interface VitalSigns {
    heart_rate: number;
    temperature: number;
    blood_pressure: string;
}

export interface Patient {
    id: string;
    name: string;
    room: string;
    age?: number;
    status?: 'stable' | 'critical' | 'warning';
    vital_signs?: VitalSigns;
}

export interface LiveMonitorProps {
    eegData: ProcessedEEGPoint[];
    classification: {
        id: number;
        status: string;
        color: string;
        severity: string;
    };
    selectedPatient: Patient | null;
    setSelectedPatient: (patient: Patient) => void;
    isLive: boolean;
    currentTime: string;
}

export interface User {
    id: string;
    username: string;
    name: string;
    role: string;
    token: string;
    permissions: string[];
    profileImage: string | null;
    updatedAt?: string;
}

export interface PredictResult {
    prediction: number;
    confidence_scores: {
    seizure: number;
    lpd: number;
    gpd: number;
    lrda: number;
    grda: number;
    others: number;
    };
}

export const USER_ROLES = {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    TECHNICIAN: 'technician',
    RESEARCHER: 'researcher',
    GUEST: 'guest'
} as const;

export  interface UserContextType {
    currentUser: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (username: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
    logout: () => void;
    updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; user?: User; error?: string }>;
    hasPermission: (permission: string) => boolean;
    hasRole: (role: string) => boolean;
    getPatientAccess: () => string[];
    USER_ROLES: typeof USER_ROLES;
}

