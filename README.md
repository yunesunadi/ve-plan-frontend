# VE-Plan Frontend

A comprehensive virtual event planning platform frontend built with Angular, RxJS, TypeScript, Angular Material and Bootstrap. VE-Plan enables users to organize and attend virtual events with real-time features, email notifications, and extensive user management.

## Features

### Authentication & User Management
- **Multi-role System**: Organizer and attendee roles with different permissions
- **Social Authentication**: Google and Facebook OAuth integration
- **Email Verification**: Secure email verification system
- **Password Management**: Forgot password and reset functionality

### Event Management (Organizer)
- **Event Creation**: Create, view, edit, and delete events with details
- **Session Management**: Organize events into multiple sessions
- **Calendar Interface**: FullCalendar integration for event visualization
- **Advanced Filtering**: Search and filter events by keyword, time, category, and status
- **User Management**: 
  - View and manage registered users
  - Send approval emails
  - Search and invite users
  - Send invitation emails
- **Meeting Integration**: 
  - Create virtual meetings with 8x8.vc integration
  - Attendee tracking and management
  - Send meeting emails
  - Real-time meeting statistics dashboard

### Event Participation (Attendee)
- **Event Discovery**: Browse and search available events
- **Registration System**: Register and unregister from events
- **Invitation Management**: Receive and accept event invitations
- **Personal Dashboard**: View joined events and invitations
- **Meeting Participation**: Join virtual meetings seamlessly
- **Meeting integration**: 8x8.vc video calls

### User Interface
- **Modern Design**: Material Design with custom theming
- **Responsive Layout**: Bootstrap 5 for mobile-first design
- **Real-time Updates**: Socket.IO integration for live notifications
- **Infinite Scrolling**: Optimized performance for large datasets
- **Data Visualization**: Chart.js integration for meeting statistics

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Route Guards**: Protected routes based on user roles
- **HTTP Interceptors**: Automatic error handling
- **Social OAuth**: Secure third-party authentication
- **Email Verification**: Account verification system

## Technology Stack

- Angular
- RxJS
- TypeScript
- Angular Material
- Bootstrap
- FullCalendar
- Chart.js
- Socket.IO Client
