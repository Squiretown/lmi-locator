// In the sendInvitationMutation's onSuccess handler (replace lines 161-171) with:
      if (!data?.success || (!data.emailSent && !data.smsSent)) {
        toast.error('Failed to send invitation.');
        return;
      }
      const message = data.emailSent && data.smsSent
        ? 'Invitation sent successfully via email and SMS'
        : data.emailSent
        ? 'Invitation sent successfully via email'
        : data.smsSent
        ? 'Invitation sent successfully via SMS'
        : '';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['client-invitations'] });