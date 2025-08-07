// ... after updating invitation and before returning response (replace previous success response block)
    // Only return success if at least one message was actually sent
    const wasActuallySent = emailSent || smsSent;
    return new Response(
      JSON.stringify({
        success: wasActuallySent,
        message: wasActuallySent
          ? (emailSent && smsSent)
            ? 'Invitation sent via email and SMS successfully'
            : emailSent
            ? 'Invitation sent via email successfully'
            : 'Invitation sent via SMS successfully'
          : 'Failed to send invitation',
        emailSent,
        smsSent,
      }),
      {
        status: wasActuallySent ? 200 : 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );