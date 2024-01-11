import { URL, relative, type LogLevel, type Request } from '../types/index.js';

import { findClientIp } from './functions.js';

/**********************************************************************************/

export default class Logger {
  private static readonly logMsgSeparator =
    '--------------------------------------------------------------------------------';

  private static readonly _dateTimeFormatter = new Intl.DateTimeFormat(
    'en-CA',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h24',
      timeZone: 'UTC'
    }
  );

  private readonly _infoLogs: string[];
  private readonly _warnLogs: string[];
  private readonly _errLogs: string[];

  public constructor() {
    this._infoLogs = [];
    this._warnLogs = [];
    this._errLogs = [];
  }

  public static readonly nativeLog = (level: LogLevel, msg: string) => {
    console[level](
      `\n${Logger.logMsgSeparator}\n\n${Logger._getLogTimestamp(level)}\n${msg}`
    );
  };

  public static readonly getErrorLocation = (
    moduleMetaData: string,
    callerName: string
  ) => {
    return `[${relative(
      process.cwd(),
      new URL('', moduleMetaData).pathname
    )} - ${callerName}()]`;
  };

  public readonly info = (msg: string) => {
    this._infoLogs.push(msg);
  };

  public readonly warn = (msg: string) => {
    this._warnLogs.push(msg);
  };

  public readonly error = (msg: string) => {
    this._errLogs.push(msg);
  };

  public readonly logRequest = (req: Request) => {
    if (this._infoLogs.length) {
      this._logInfoLevel(req);
      this._infoLogs.length = 0;
    }
    if (this._warnLogs.length) {
      this._logWarningLevel(req);
      this._warnLogs.length = 0;
    }
    if (this._errLogs.length) {
      this._logErrorLevel(req);
      this._errLogs.length = 0;
    }
  };

  /********************************************************************************/

  /**
   * RFC3339 Compliant date-time format, see:
   * {@link https://datatracker.ietf.org/doc/html/rfc3339#section-5.6}
   */
  private static readonly _dateToRFC3339DateTime = (date: Date) => {
    return Logger._dateTimeFormatter.format(date);
  };

  private static readonly _getLogTimestamp = (level: LogLevel) => {
    return `[${Logger._dateToRFC3339DateTime(
      new Date()
    )} - ${level.toUpperCase()}]`;
  };

  private readonly _getRequestPrefix = (req: Request, level: LogLevel) => {
    return `${Logger._getLogTimestamp(level)}\n\n '${
      req.method
    }' request from '${findClientIp(req)}' for '${req.originalUrl}'\n`;
  };

  private readonly _getTotalRequestTimeMsg = (startTime: number) => {
    return `The request took a total of ${(
      performance.now() - startTime
    ).toFixed(2)} milliseconds`;
  };

  private readonly _logInfoLevel = (req: Request) => {
    const reqPrefix = this._getRequestPrefix(req, 'info');
    const infoLogs: string[] = this._infoLogs.map((logMsg) => {
      return `* ${logMsg}`;
    });
    infoLogs.unshift(reqPrefix);

    console.info(
      `${infoLogs.join('\n')}\n\n${this._getTotalRequestTimeMsg(
        req.dashboard.startTime
      )}\n\n${Logger.logMsgSeparator}\n`
    );
  };

  private readonly _logWarningLevel = (req: Request) => {
    const reqPrefix = this._getRequestPrefix(req, 'warn');
    const warnLogs: string[] = this._warnLogs.map((logMsg) => {
      return `* ${logMsg}`;
    });
    warnLogs.unshift(reqPrefix);

    console.warn(
      `${warnLogs.join('\n')}\n\n${this._getTotalRequestTimeMsg(
        req.dashboard.startTime
      )}\n\n${Logger.logMsgSeparator}\n`
    );
  };

  private readonly _logErrorLevel = (req: Request) => {
    const reqPrefix = this._getRequestPrefix(req, 'error');
    const errLogs: string[] = this._errLogs.map((logMsg) => {
      return `* ${logMsg}`;
    });
    errLogs.unshift(reqPrefix);

    console.error(
      `${errLogs.join('\n')}\n\n${this._getTotalRequestTimeMsg(
        req.dashboard.startTime
      )}\n\n${Logger.logMsgSeparator}\n`
    );
  };
}
