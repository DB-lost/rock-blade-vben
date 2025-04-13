import JSEncrypt from 'jsencrypt';

/**
 * RSA加密工具类
 */
export class RSACrypto {
  // eslint-disable-next-line no-use-before-define
  private static instance: RSACrypto;
  private encryptor: JSEncrypt | null = null;
  private nonce: string = ''; // 存储随机字符串
  private publicKey: string = '';

  private constructor() {
    this.encryptor = new JSEncrypt();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): RSACrypto {
    if (!RSACrypto.instance) {
      RSACrypto.instance = new RSACrypto();
    }
    return RSACrypto.instance;
  }

  /**
   * RSA加密
   * @param data 要加密的数据
   * @returns 加密后的数据，如果加密失败则返回null
   */
  public encryptData(data: string): null | string {
    if (!this.encryptor || !this.publicKey || !this.nonce) {
      return null;
    }
    const result = this.encryptor.encrypt(data);
    return result === false ? null : result;
  }

  /**
   * 获取随机字符串
   */
  public getNonce(): string {
    return this.nonce;
  }

  /**
   * 获取当前公钥
   */
  public getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * 检查是否已设置公钥
   */
  public hasPublicKey(): boolean {
    return !!this.publicKey;
  }

  /**
   * 设置公钥和随机字符串
   * @param publicKey RSA公钥
   * @param nonce 随机字符串
   */
  public setPublicKey(publicKey: string, nonce: string): void {
    this.publicKey = publicKey;
    this.nonce = nonce;
    if (this.encryptor) {
      this.encryptor.setPublicKey(publicKey);
    }
  }
}

// 导出单例实例
export const rsaCrypto = RSACrypto.getInstance();

/**
 * 加密密码
 * @param password 原始密码
 * @returns 加密后的密码，如果加密失败则返回null
 */
export function encryptPassword(password: string): null | string {
  return rsaCrypto.encryptData(password);
}
