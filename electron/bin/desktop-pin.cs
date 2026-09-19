using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Threading;

public class DesktopPin
{
    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern int GetWindowLong(IntPtr hWnd, int nIndex);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    public static extern bool IsWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);

    public const int GWL_EXSTYLE = -20;
    public const int WS_EX_TOPMOST = 0x00000008;
    public const int WS_EX_TOOLWINDOW = 0x00000080;

    public static readonly IntPtr HWND_BOTTOM = (IntPtr)1;
    public static readonly IntPtr HWND_TOPMOST = (IntPtr)(-1);
    public static readonly IntPtr HWND_NOTOPMOST = (IntPtr)(-2);

    public const uint SWP_NOSIZE = 0x0001;
    public const uint SWP_NOMOVE = 0x0002;
    public const uint SWP_NOACTIVATE = 0x0010;
    public const uint SWP_FRAMECHANGED = 0x0020;

    // Set of HWNDs that should remain pinned to desktop wallpaper level (behind all applications)
    private static readonly HashSet<IntPtr> pinnedHwnds = new HashSet<IntPtr>();
    private static readonly object syncLock = new object();

    public static void PinToBottom(IntPtr hWnd)
    {
        try
        {
            if (!IsWindow(hWnd)) return;

            int exStyle = GetWindowLong(hWnd, GWL_EXSTYLE);
            exStyle &= ~WS_EX_TOPMOST;
            exStyle &= ~WS_EX_TOOLWINDOW;
            SetWindowLong(hWnd, GWL_EXSTYLE, exStyle);

            SetWindowPos(hWnd, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE);
            SetWindowPos(hWnd, HWND_BOTTOM, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE | SWP_FRAMECHANGED);

            lock (syncLock)
            {
                pinnedHwnds.Add(hWnd);
            }
        }
        catch { }
    }

    public static void SetTopMost(IntPtr hWnd)
    {
        try
        {
            lock (syncLock)
            {
                pinnedHwnds.Remove(hWnd);
            }

            if (!IsWindow(hWnd)) return;

            int exStyle = GetWindowLong(hWnd, GWL_EXSTYLE);
            exStyle |= WS_EX_TOPMOST;
            SetWindowLong(hWnd, GWL_EXSTYLE, exStyle);

            SetWindowPos(hWnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
        }
        catch { }
    }

    public static void RemoveHwnd(IntPtr hWnd)
    {
        lock (syncLock)
        {
            pinnedHwnds.Remove(hWnd);
        }
    }

    public static void ClearAll()
    {
        lock (syncLock)
        {
            pinnedHwnds.Clear();
        }
    }

    private static void BackgroundEnforcer()
    {
        while (true)
        {
            try
            {
                Thread.Sleep(80);

                IntPtr fg = GetForegroundWindow();
                if (fg == IntPtr.Zero) continue;

                lock (syncLock)
                {
                    // If the active foreground window is NOT one of our pinned widgets:
                    // (i.e. User is working in VS Code, browser, terminal, file explorer, or web application)
                    if (!pinnedHwnds.Contains(fg))
                    {
                        List<IntPtr> toRemove = null;
                        foreach (IntPtr h in pinnedHwnds)
                        {
                            if (!IsWindow(h))
                            {
                                if (toRemove == null) toRemove = new List<IntPtr>();
                                toRemove.Add(h);
                                continue;
                            }

                            if (IsWindowVisible(h))
                            {
                                // Strictly push behind any active applications so it NEVER pops up
                                SetWindowPos(h, HWND_BOTTOM, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE);
                            }
                        }

                        if (toRemove != null)
                        {
                            foreach (var deadHwnd in toRemove)
                            {
                                pinnedHwnds.Remove(deadHwnd);
                            }
                        }
                    }
                }
            }
            catch { }
        }
    }

    public static void HandleLine(string line)
    {
        if (string.IsNullOrEmpty(line)) return;

        string[] parts = line.Trim().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return;

        string cmd = parts[0].ToLowerInvariant();

        if (cmd == "clear")
        {
            ClearAll();
            Console.WriteLine("OK clear");
            return;
        }

        if (parts.Length < 2)
        {
            Console.WriteLine("ERR invalid_args");
            return;
        }

        long rawHwnd;
        string hwndStr = parts[1];
        if (hwndStr.StartsWith("0x", StringComparison.OrdinalIgnoreCase))
        {
            rawHwnd = Convert.ToInt64(hwndStr.Substring(2), 16);
        }
        else
        {
            if (!long.TryParse(hwndStr, out rawHwnd))
            {
                Console.WriteLine("ERR invalid_hwnd");
                return;
            }
        }

        IntPtr hWnd = new IntPtr(rawHwnd);

        switch (cmd)
        {
            case "bottom":
                PinToBottom(hWnd);
                Console.WriteLine("OK bottom " + hWnd);
                break;
            case "topmost":
                SetTopMost(hWnd);
                Console.WriteLine("OK topmost " + hWnd);
                break;
            case "remove":
                RemoveHwnd(hWnd);
                Console.WriteLine("OK remove " + hWnd);
                break;
            default:
                Console.WriteLine("ERR unknown_cmd");
                break;
        }
    }

    public static void Main(string[] args)
    {
        // Start background desktop level enforcer thread
        Thread enforcerThread = new Thread(BackgroundEnforcer);
        enforcerThread.IsBackground = true;
        enforcerThread.Start();

        // If one-off argument provided, process and exit
        if (args.Length > 0)
        {
            HandleLine(string.Join(" ", args));
            return;
        }

        // Daemon mode: listen on stdin
        string line;
        while ((line = Console.ReadLine()) != null)
        {
            HandleLine(line);
        }
    }
}
