// Mock Email Service - Console logging with activity tracking

import type { Company, PlatformUser } from '@/types/domain';
import type { EmailService } from '@/services/interfaces';
import { MockActivityService } from './activity-service';

export class MockEmailService implements EmailService {
  private activityService = new MockActivityService();

  async sendCompanySuspended(company: Company, reason?: string): Promise<void> {
    // Mock email send (log to console)
    console.info('[Email] Company Suspended', {
      to: company.adminUserId ? `admin@${company.companyUid}.com` : 'unknown',
      company: company.name,
      reason: reason || 'Administrative action',
      template: 'company-suspended'
    });

    // Log activity
    await this.activityService.logEvent({
      companyId: company.id,
      type: 'email.sent',
      targetType: 'email',
      targetId: 'company-suspended',
      meta: { 
        emailType: 'company-suspended',
        recipient: company.adminUserId,
        reason
      }
    });

    // Simulate email send delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async sendCompanyReinstated(company: Company): Promise<void> {
    console.info('[Email] Company Reinstated', {
      to: company.adminUserId ? `admin@${company.companyUid}.com` : 'unknown',
      company: company.name,
      template: 'company-reinstated'
    });

    await this.activityService.logEvent({
      companyId: company.id,
      type: 'email.sent',
      targetType: 'email',
      targetId: 'company-reinstated',
      meta: { 
        emailType: 'company-reinstated',
        recipient: company.adminUserId
      }
    });

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async sendUserInvitation(user: PlatformUser, tempPassword?: string): Promise<void> {
    console.info('[Email] User Invitation', {
      to: user.email,
      user: `${user.firstName} ${user.lastName}`,
      role: user.role,
      company: user.companyId,
      tempPassword: tempPassword ? '***hidden***' : 'none',
      template: 'user-invitation'
    });

    await this.activityService.logEvent({
      companyId: user.companyId,
      userId: user.id,
      type: 'email.sent',
      targetType: 'email',
      targetId: 'user-invitation',
      meta: { 
        emailType: 'user-invitation',
        recipient: user.email,
        role: user.role,
        hasTempPassword: !!tempPassword
      }
    });

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async sendUserSuspended(user: PlatformUser, reason?: string): Promise<void> {
    console.info('[Email] User Suspended', {
      to: user.email,
      user: `${user.firstName} ${user.lastName}`,
      company: user.companyId,
      reason: reason || 'Administrative action',
      template: 'user-suspended'
    });

    await this.activityService.logEvent({
      companyId: user.companyId,
      userId: user.id,
      type: 'email.sent',
      targetType: 'email',
      targetId: 'user-suspended',
      meta: { 
        emailType: 'user-suspended',
        recipient: user.email,
        reason
      }
    });

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async sendUserReinstated(user: PlatformUser): Promise<void> {
    console.info('[Email] User Reinstated', {
      to: user.email,
      user: `${user.firstName} ${user.lastName}`,
      company: user.companyId,
      template: 'user-reinstated'
    });

    await this.activityService.logEvent({
      companyId: user.companyId,
      userId: user.id,
      type: 'email.sent',
      targetType: 'email',
      targetId: 'user-reinstated',
      meta: { 
        emailType: 'user-reinstated',
        recipient: user.email
      }
    });

    await new Promise(resolve => setTimeout(resolve, 100));
  }
}