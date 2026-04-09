import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const stories = [
  {
    title: "Child Almost Falls from Window",
    content: "A toddler climbs onto a window ledge on the 3rd floor while parent is briefly out of the room. A passerby on the street below notices and rushes upstairs to alert the family just in time."
  },
  {
    title: "Dog Saves Child from Drowning",
    content: "A family dog spots a 4-year-old silently slipping into the backyard pool. The dog jumps in and keeps the child afloat, barking until the parents rush out."
  },
  {
    title: "Cat Wakes Owner During House Fire",
    content: "In the middle of the night, a cat persistently paws at its sleeping owner's face. The owner wakes up to find the kitchen on fire — the smoke detector battery had died."
  },
  {
    title: "Stranger Performs CPR on Collapsed Runner",
    content: "A marathon runner collapses mid-race from cardiac arrest. A bystander with medical training pushes through the crowd and performs CPR until paramedics arrive, saving the runner's life."
  },
  {
    title: "Security Guard Saves Choking Child",
    content: "A mall security guard on routine patrol notices a toddler silently choking in a food court while panicked parents look on. He performs the Heimlich maneuver and dislodges the obstruction."
  },
  {
    title: "Woman Stops Runaway Stroller",
    content: "A stroller with an infant inside begins rolling down a steep parking lot ramp toward traffic. A passing woman sprints and grabs it just before it reaches the road."
  },
  {
    title: "Cyclist Helps Fallen Elderly Person",
    content: "An elderly woman trips and falls on a busy sidewalk. A cyclist immediately stops, helps her up, calls an ambulance, and stays with her until help arrives."
  },
  {
    title: "Kids Form Human Chain to Save Drowning Friend",
    content: "A group of children at a river beach notice their friend caught in a current. Unable to swim out, they form a human chain from the shore and pull him to safety."
  },
  {
    title: "Toddler Wanders Near Pool — Dog Blocks Path",
    content: "A toddler slips out of a sliding door and walks toward the family pool. The family dog plants itself in front of the child, barking loudly and refusing to let them pass until the parents arrive."
  },
  {
    title: "Driver Stops Highway Traffic to Save Injured Dog",
    content: "A dog is hit by a car on a busy highway and left in the road. A driver parks their car across a lane, exits, and carries the injured dog to safety while managing to slow traffic."
  },
  {
    title: "Stranger Gives Jacket to Freezing Homeless Man",
    content: "On a freezing winter night, a pedestrian removes their own jacket and wraps it around a homeless man sleeping on a bench. They also leave money for a meal and call a shelter."
  },
  {
    title: "Bird Trapped in Store Helped to Freedom",
    content: "A bird flies into a large store and panics, repeatedly hitting windows. A staff member carefully guides it toward the exit using a broomstick and cardboard over 20 minutes until it flies free."
  },
  {
    title: "Good Samaritan Helps Stranded Motorist in Storm",
    content: "During a severe storm, a driver's car breaks down on a deserted road. A passing truck driver stops, provides tools, helps fix the issue, and follows behind until the car safely reaches the next town."
  },
  {
    title: "Child Reunited with Lost Dog",
    content: "A family searches for their missing dog for days. A neighbor spots it miles away, recognizes the dog from a flyer, and drives it home — arriving just as the heartbroken child is taking down the posters."
  },
  {
    title: "Baby Carriage Stopped Before Rolling Into Traffic",
    content: "A mother briefly lets go of a stroller on a sloped sidewalk to check her phone. The stroller begins rolling toward a busy intersection. A nearby shop owner rushes out and stops it with seconds to spare."
  },
  {
    title: "Man Rescues Cat from Burning Building",
    content: "Firefighters have controlled the blaze but can't re-enter for a resident's cat. The owner's neighbor, knowing the cat's hiding spot, waits for clearance and runs in to retrieve it."
  },
  {
    title: "Horse Escapes, Neighborhood Rallies Together",
    content: "A horse escapes from a residential stable and runs through the neighborhood. Neighbors spontaneously form a wide human arc to calmly guide the horse back to its pen without panicking it."
  },
  {
    title: "Child Locks Itself in Hot Car",
    content: "A toddler accidentally locks itself inside a car on a hot summer day. Bystanders work together — one calls 911, another finds a slim jim, a third shields the child's side of the car from the sun until the door is opened."
  },
  {
    title: "Elderly Couple Helped During Flash Flood",
    content: "Flash flooding traps an elderly couple on their porch. Two neighbors wade through knee-deep water, form a linked-arm chain, and guide the couple to higher ground before the water rises further."
  },
  {
    title: "Child's Balloon Returned by Kind Stranger",
    content: "A child's birthday balloon escapes and floats into a neighbor's tree. A stranger climbs a ladder to retrieve it, then ties it securely to the child's wrist with a note: 'Hold on tight.'"
  }
]

async function main() {
  console.log('Seeding database with 20 stories...')

  for (const story of stories) {
    await prisma.story.create({ data: story })
  }

  console.log('Seeded 20 stories.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
