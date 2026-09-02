/**
 * Pinggo WhatsApp API Service
 * Ported from PHP Implementation
 */

export class PinggoService {
  private apiKey: string;
  private userId: string;
  private vendorPhone: string;
  private baseUrl: string = "https://beta.pinggo.in";

  constructor(apiKey: string, userId: string, vendorPhone: string) {
    this.apiKey = apiKey;
    this.userId = userId;
    this.vendorPhone = vendorPhone;
  }

  /**
   * Send a standard text message
   */
  async sendTextMessage(recipients: string | string[], message: string) {
    const recipientList = Array.isArray(recipients) ? recipients : [recipients];
    
    // Format numbers
    const formattedRecipients = recipientList.map(num => {
      const cleaned = num.replace(/[^0-9]/g, '');
      if (cleaned.length === 10) {
        return '91' + cleaned;
      }
      return cleaned;
    });

    const payload = {
      userId: this.userId,
      vendorPhoneNumber: this.vendorPhone,
      recipientPhoneNumbers: formattedRecipients,
      messageText: message,
      messageType: "text"
    };

    return this.post('/api/user-api-service/send-message', payload);
  }

  /**
   * Send a template message
   */
  async sendTemplateMessage(recipients: string | string[], templateName: string, bodyVariables: Record<string, string> = {}) {
    const recipientList = Array.isArray(recipients) ? recipients : [recipients];
    
    const formattedRecipients = recipientList.map(num => {
      const cleaned = num.replace(/[^0-9]/g, '');
      if (cleaned.length === 10) return '91' + cleaned;
      return cleaned;
    });

    const payload = {
      userId: this.userId,
      vendorPhoneNumber: this.vendorPhone,
      recipientPhoneNumbers: formattedRecipients,
      messageType: "template",
      templateName: templateName,
      bodyVariables: bodyVariables,
      headerVariables: "",
      templateFileUrl: "",
      couponCode: "",
      dynamicUrlSuffix: "",
      otpCode: ""
    };

    return this.post('/api/user-api-service/send-message', payload);
  }

  private async post(endpoint: string, data: unknown) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: `HTTP Error ${response.status}: ${responseData.message || 'Unknown error'}`
        };
      }

      let isSuccess = responseData.success === true;
      let message = responseData.message || 'Unknown API response';

      if (responseData.data && typeof responseData.data.success !== 'undefined') {
        isSuccess = responseData.data.success === true;
        message = responseData.data.message || message;
      }

      return {
        success: isSuccess,
        data: responseData,
        message: message
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Request failed";
      return {
        success: false,
        message: `Network Error: ${message}`
      };
    }
  }
}
