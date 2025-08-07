// Replace the sendInvitation function's success toast logic (lines 144-154) with:
      if (!data?.success || (!data.emailSent && !data.smsSent)) {
        throw new Error(data?.error || 'Failed to send invitation');
      }

      let sentType = [];
      if (data.emailSent) sentType.push('email');
      if (data.smsSent) sentType.push('SMS');
      toast.success(`Invitation sent via ${sentType.join(' & ')} successfully!`);