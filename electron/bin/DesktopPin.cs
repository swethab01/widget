using System;
using System.Runtime.InteropServices;
using System.Threading;

class DesktopPin {
    [DllImport("user32.dll", SetLastError = true)]
    static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

    [DllImport("user32.dll", SetLastError = true)]
    static extern int GetWindowLong(IntPtr hWnd, int nIndex);

    [DllImport("user32.dll", SetLastError = true)]
    static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

    static readonly IntPtr HWND_BOTTOM = new IntPtr(1);
    static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
    static readonly IntPtr HWND_NOTOPMOST = new IntPtr(-2);

    const uint SWP_NOSIZE = 0x0001;
    const uint SWP_NOMOVE = 0x0002;
    const uint SWP_NOACTIVATE = 0x0010;
    const uint SWP_FRAMECHANGED = 0x0020;
    const uint SWP_SHOWWINDOW = 0x0040;

    const int GWL_EXSTYLE = -20;
    const int WS_EX_TOPMOST = 0x00000008;
    const int WS_EX_TOOLWINDOW = 0x00000080;

    static void PinToBottom(IntPtr hwnd) {
        try {
            int exStyle = GetWindowLong(hwnd, GWL_EXSTYLE);
            // Remove WS_EX_TOPMOST and WS_EX_TOOLWINDOW so it behaves like a standard desktop element
            int newExStyle = exStyle & ~WS_EX_TOPMOST & ~WS_EX_TOOLWINDOW;
            if (newExStyle != exStyle) {
                SetWindowLong(hwnd, GWL_EXSTYLE, newExStyle);
            }

            // Remove topmost first
            SetWindowPos(hwnd, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE);
            // Place window at the bottom of the Z-order (above desktop wallpaper/icons, behind apps)
            SetWindowPos(hwnd, HWND_BOTTOM, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE | SWP_FRAMECHANGED);
        } catch {}
    }

    static void SetTopMost(IntPtr hwnd, bool topmost) {
        try {
            if (topmost) {
                SetWindowPos(hwnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW);
            } else {
                PinToBottom(hwnd);
            }
        } catch {}
    }

    static void HandleLine(string line) {
        if (string.IsNullOrEmpty(line)) return;
        string[] parts = line.Trim().Split(new char[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length < 2) {
            Console.WriteLine("ERR invalid_args");
            return;
        }

        string cmd = parts[0].ToLowerInvariant();
        long val = 0;
        try {
            if (parts[1].StartsWith("0x", StringComparison.OrdinalIgnoreCase)) {
                val = Convert.ToInt64(parts[1], 16);
            } else {
                val = Convert.ToInt64(parts[1]);
            }
        } catch {
            Console.WriteLine("ERR invalid_hwnd");
            return;
        }

        IntPtr hwnd = new IntPtr(val);
        if (cmd == "bottom") {
            PinToBottom(hwnd);
            Console.WriteLine("OK bottom " + val);
        } else if (cmd == "topmost") {
            SetTopMost(hwnd, true);
            Console.WriteLine("OK topmost " + val);
        } else if (cmd == "notopmost") {
            SetTopMost(hwnd, false);
            Console.WriteLine("OK notopmost " + val);
        } else {
            Console.WriteLine("ERR unknown_cmd");
        }
    }

    static void Main(string[] args) {
        // If passed command-line arguments, process one-off and exit
        if (args.Length >= 2) {
            HandleLine(string.Join(" ", args));
            return;
        }

        // Daemon mode: continuously process commands from stdin with 0ms latency
        string line;
        while ((line = Console.ReadLine()) != null) {
            HandleLine(line);
        }
    }
}
