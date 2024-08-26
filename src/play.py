import requests
import xml.etree.ElementTree as ET
from tkinter import Tk, Frame, BOTH
from tkinter import ttk
from tkinter import font as tkFont
from collections import defaultdict

URL = "http://www.nasdaqtrader.com/rss.aspx?feed=tradehalts"

class HaltAlertApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Halt Alert")
        self.root.geometry("600x300")
        self.root.configure(bg='#1a1a1a')

        self.foreground_color = "#a9a9a9"
        self.background_color = "#1a1a1a"
        self.highlight_color = "#ff7f00"
        self.halt_fore = "#ffffff"
        self.halt_back = "#bc1f4b"

        self.my_font = tkFont.Font(family="Calibri", size=8)
        self.my_font_bold = tkFont.Font(family="Calibri", size=8, weight="bold")

        self.halt_data = defaultdict(list)

        self.create_widgets()

    def create_widgets(self):
        self.tree = ttk.Treeview(self.root, columns=("Symbol", "Time", "Last", "Chg %", "Float", "Rot", "PubDate"),
                                 show="headings", height=10)

        style = ttk.Style()
        style.configure("Treeview", foreground=self.foreground_color, background=self.background_color,
                        fieldbackground=self.background_color, font=self.my_font)
        style.configure("Treeview.Heading", background="#3c3c3c", foreground=self.foreground_color, font=self.my_font_bold)
        style.map("Treeview.Heading", background=[('active', self.highlight_color)])

        self.tree.heading("Symbol", text="Symbol")
        self.tree.heading("Time", text="Time")
        self.tree.heading("Last", text="Last")
        self.tree.heading("Chg %", text="Chg %")
        self.tree.heading("Float", text="Float")
        self.tree.heading("Rot", text="Rot")
        self.tree.heading("PubDate", text="PubDate")

        self.tree.column("Symbol", width=80)
        self.tree.column("Time", width=50)
        self.tree.column("Last", width=50)
        self.tree.column("Chg %", width=50)
        self.tree.column("Float", width=40)
        self.tree.column("Rot", width=40)
        self.tree.column("PubDate", width=40, anchor='center')

        self.tree.pack(fill=BOTH, expand=True)

        self.scan_halt()

    def scan_halt(self):
        response = requests.get(URL)
        root = ET.fromstring(response.content)
        items = root.findall('.//item')

        for item in items:
            reason_code = item.find('ndaq:ReasonCode').text
            if reason_code in ["M", "LUDP"]:
                symbol = item.find('ndaq:IssueSymbol').text
                halt_time = item.find('ndaq:HaltTime').text
                resume_time = item.find('ndaq:ResumptionTradeTime').text
                pub_date = item.find('pubDate').text
                self.halt_data[symbol].append((resume_time, pub_date))

                self.tree.insert("", "end", values=(symbol, resume_time, "", "", "", "", pub_date))

        self.update_grid()

    def update_grid(self):
        for item in self.tree.get_children():
            values = self.tree.item(item, "values")
            if values[1] == "":
                self.tree.item(item, tags=("halted",))
            else:
                self.tree.item(item, tags=("normal",))

        self.tree.tag_configure("halted", background=self.halt_back, foreground=self.halt_fore)
        self.tree.tag_configure("normal", background=self.background_color, foreground=self.foreground_color)

if __name__ == "__main__":
    root = Tk()
    app = HaltAlertApp(root)
    root.mainloop()