export default class DashboardError extends Error {
  private readonly _msg;
  private readonly _code;

  public constructor(msg: string, code: number) {
    super(msg);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);

    this._msg = msg;
    this._code = code;
  }

  public getMessage() {
    return this._msg;
  }

  public getCode() {
    return this._code;
  }
}
