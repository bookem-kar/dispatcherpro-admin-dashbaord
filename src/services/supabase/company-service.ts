import { supabase } from '@/integrations/supabase/client';
import type { CompanyService } from '../interfaces';
import type { Company, CompanyFilter, CreateCompanyInput } from '@/types/domain';

function mapSupabaseToCompany(row: any): Company {
  return {
    id: row.id,
    name: row.name,
    companyUid: row.company_uid,
    companyStringUuid: row.company_string_uuid,
    status: row.status,
    planTier: row.plan_tier,
    adminUserId: row.admin_user_id,
    maxSeats: row.max_seats,
    activeUserCount: row.active_user_count || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    suspendedAt: row.suspended_at,
    suspendedReason: row.suspended_reason,
    lastActivityAt: row.last_activity_at,
    phoneTollFree: row.phone_toll_free,
    phoneNumber: row.phone_number,
    faxNumber: row.fax_number,
    address: row.address,
    email: row.email,
    mcNumber: row.mc_number,
    website: row.website,
    adminFirstName: row.admin_first_name,
    adminLastName: row.admin_last_name,
    adminEmail: row.admin_email,
    adminPhone: row.admin_phone,
    bubbleCompanyId: row.bubble_company_id,
    superDispatchAcct: row.super_dispatch_acct,
    centralDispatchAcct: row.central_dispatch_acct,
  };
}

export class SupabaseCompanyService implements CompanyService {
  async listCompanies(filter?: CompanyFilter): Promise<Company[]> {
    let query = supabase.from('companies').select('*');

    if (filter?.status) {
      query = query.eq('status', filter.status);
    }

    if (filter?.planTier) {
      query = query.eq('plan_tier', filter.planTier);
    }

    if (filter?.search) {
      query = query.or(`name.ilike.%${filter.search}%,email.ilike.%${filter.search}%,mc_number.ilike.%${filter.search}%`);
    }

    // Apply pagination
    if (filter?.page && filter?.limit) {
      const from = (filter.page - 1) * filter.limit;
      const to = from + filter.limit - 1;
      query = query.range(from, to);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch companies: ${error.message}`);
    }

    return data?.map(mapSupabaseToCompany) || [];
  }

  async getCompany(id: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch company: ${error.message}`);
    }

    return data ? mapSupabaseToCompany(data) : null;
  }

  async createCompany(input: CreateCompanyInput): Promise<Company> {
    // Generate a unique company_uid
    const companyUid = `comp-${Date.now()}`;

    const insertData = {
      name: input.name,
      company_uid: companyUid,
      phone_toll_free: input.phoneTollFree,
      phone_number: input.phoneNumber,
      fax_number: input.faxNumber,
      address: input.address,
      email: input.email,
      mc_number: input.mcNumber,
      website: input.website,
      admin_first_name: input.adminFirstName,
      admin_last_name: input.adminLastName,
      admin_email: input.adminEmail,
      admin_phone: input.adminPhone,
      status: 'inactive', // Start as inactive until activated
    };

    const { data, error } = await supabase
      .from('companies')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create company: ${error.message}`);
    }

    return mapSupabaseToCompany(data);
  }

  async updateCompany(id: string, patch: Partial<Company>): Promise<Company> {
    const updateData: any = {};

    // Map Company fields to database columns
    if (patch.name !== undefined) updateData.name = patch.name;
    if (patch.status !== undefined) updateData.status = patch.status;
    if (patch.planTier !== undefined) updateData.plan_tier = patch.planTier;
    if (patch.companyStringUuid !== undefined) updateData.company_string_uuid = patch.companyStringUuid;
    if (patch.maxSeats !== undefined) updateData.max_seats = patch.maxSeats;
    if (patch.activeUserCount !== undefined) updateData.active_user_count = patch.activeUserCount;
    if (patch.suspendedAt !== undefined) updateData.suspended_at = patch.suspendedAt;
    if (patch.suspendedReason !== undefined) updateData.suspended_reason = patch.suspendedReason;
    if (patch.lastActivityAt !== undefined) updateData.last_activity_at = patch.lastActivityAt;
    if (patch.phoneTollFree !== undefined) updateData.phone_toll_free = patch.phoneTollFree;
    if (patch.phoneNumber !== undefined) updateData.phone_number = patch.phoneNumber;
    if (patch.faxNumber !== undefined) updateData.fax_number = patch.faxNumber;
    if (patch.address !== undefined) updateData.address = patch.address;
    if (patch.email !== undefined) updateData.email = patch.email;
    if (patch.mcNumber !== undefined) updateData.mc_number = patch.mcNumber;
    if (patch.website !== undefined) updateData.website = patch.website;
    if (patch.adminFirstName !== undefined) updateData.admin_first_name = patch.adminFirstName;
    if (patch.adminLastName !== undefined) updateData.admin_last_name = patch.adminLastName;
    if (patch.adminEmail !== undefined) updateData.admin_email = patch.adminEmail;
    if (patch.adminPhone !== undefined) updateData.admin_phone = patch.adminPhone;
    if (patch.bubbleCompanyId !== undefined) updateData.bubble_company_id = patch.bubbleCompanyId;
    if (patch.superDispatchAcct !== undefined) updateData.super_dispatch_acct = patch.superDispatchAcct;
    if (patch.centralDispatchAcct !== undefined) updateData.central_dispatch_acct = patch.centralDispatchAcct;

    const { data, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update company: ${error.message}`);
    }

    return mapSupabaseToCompany(data);
  }

  async suspendCompany(id: string, reason?: string): Promise<Company> {
    const updateData = {
      status: 'suspended',
      suspended_at: new Date().toISOString(),
      suspended_reason: reason,
    };

    const { data, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to suspend company: ${error.message}`);
    }

    return mapSupabaseToCompany(data);
  }

  async reinstateCompany(id: string): Promise<Company> {
    const updateData = {
      status: 'active',
      suspended_at: null,
      suspended_reason: null,
    };

    const { data, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to reinstate company: ${error.message}`);
    }

    return mapSupabaseToCompany(data);
  }
}