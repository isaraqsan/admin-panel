import type { AvatarProps } from '@nuxt/ui'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'
export type SaleStatus = 'paid' | 'failed' | 'refunded'

export interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
  status: UserStatus
  location: string
}

export interface Mail {
  id: number
  unread?: boolean
  from: User
  subject: string
  body: string
  date: string
}

export interface Member {
  name: string
  username: string
  role: 'member' | 'owner'
  avatar: AvatarProps
}

export interface Stat {
  title: string
  icon: string
  value: number | string
  variation: number
  formatter?: (value: number) => string
}

export interface Sale {
  id: string
  date: string
  status: SaleStatus
  email: string
  amount: number
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}

interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      id: number;
      email: string;
      name?: string;
      role: string;
      company: {
        id: number;
        name: string;
        email?: string | null;
        phone?: string | null;
        logo?: string | null;
      };
    };
  };
  error?: string;
}

export interface Gallery {
  id: number
  title: string
  image: string
  createdAt: Date
}

export interface GalleryResponse {
  success: boolean
  data?: Gallery | Gallery[]
  error?: string
}

export interface Team {
  id: number
  name: string
  position: string
  photo: string | null
  bio: string | null
  createdAt: Date
}

export interface TeamResponse {
  success: boolean
  data?: Team | Team[]
  error?: string
}

export interface Company {
  id: number
  name: string
  logo?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  about?: string | null
  createdAt: string
  updatedAt?: string | null
}

export interface CompanyResponse {
  success: boolean
  data: Company | Company[] | null
  error?: string
}

interface CompanyPayload {
  name: string
  address?: string
  phone?: string
  email?: string
  about?: string
  logo?: File | null
}


