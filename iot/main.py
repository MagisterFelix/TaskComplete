import tkinter
import calendar
from datetime import datetime
from view import View


class Display(tkinter.Tk):

    def __init__(self, *args, **kwargs):
        if not kwargs.get('className'):
            kwargs['className'] = 'eInk'
        super().__init__(*args, **kwargs)

        self.width, self.height = 600, 800

        self.canvas = tkinter.Canvas(self, bg='white', width=self.width, height=self.height)
        self.canvas.pack()

        self.view = View()
        self.priorities = ['No priority', 'High priority', 'Medium priority', 'Low priority']

        self.draw()

    def draw(self):
        self.canvas.delete('all')

        cal = calendar.Calendar(0)

        days_of_week = calendar.weekheader(10).split()
        x, y = 0, 0
        self.canvas.create_rectangle(x, y, x + self.width // 2.5, y + self.height, fill='black')

        self.canvas.create_line(0, 120, x + self.width // 2.5, y + 120, width=5, fill='white')

        x, y = 120, 200
        self.canvas.create_text(x, y, text=days_of_week[datetime.today().weekday()], font='Sans 28', fill='white')
        y += 60
        self.canvas.create_text(x, y, text=datetime.today().day, font='Sans 44', fill='white')
        y += 50
        self.canvas.create_text(x, y, text=datetime.today().strftime('%B %Y'), font='Sans 16', fill='white')

        x, y = 20, 400
        for day_of_week in days_of_week:
            self.canvas.create_text(x, y, text=day_of_week[:2], anchor='w', font='Sans 12', fill='white')
            x += 30

        y = 440
        for week in cal.monthdayscalendar(datetime.today().year, datetime.today().month):
            x = 30

            for day in week:
                if not day:
                    day = ''
                elif day < 10:
                    day = ' ' + str(day)

                self.canvas.create_text(x, y, text=day, font='Sans 12', fill='white')

                x += 30
            y += 40

        self.canvas.create_line(0, y + 40, x + self.width // 2.5, y + 40, width=5, fill='white')

        def update(event, obj, task_id):
            self.canvas.itemconfigure(obj, fill='black')
            self.view.complete_task(task_id)

        def helper(obj, task_id):
            return lambda event: update(event, obj, task_id)

        tasks = sorted(self.view.get_tasks(), key=lambda key: key['date'])
        n = len(tasks)

        for i in range(n):
            y = i * self.height // 16
            for j in range(n):
                x = j * self.width
                self.canvas.create_line(x + self.width // 2.5, y + self.height // 16,
                                        x + self.width, y + self.height // 16)
                check_box = self.canvas.create_rectangle(x + self.width // 2.3, y + 15,
                                                         x + self.width // 2.3 + 20, y + 35, fill='white')
                self.canvas.tag_bind(check_box, '<Button-1>', helper(check_box, tasks[i]['id']))
                self.canvas.create_text((x + self.width // 2,
                                         y + self.height // 32),
                                        text=tasks[i]['title'], anchor='w', font=('Sans 18'), fill=['black', 'red'][0 < tasks[i]['priority'] < 3])
                self.canvas.create_text((x - self.width // 50,
                                         y + self.height // 32),
                                        text=datetime.strptime(tasks[i]['date'], '%Y-%m-%d').strftime('%b %d'), anchor='e', font=('Roboto 14'))

        self.after(5000, self.draw)


if __name__ == '__main__':
    display = Display()
    display.mainloop()
