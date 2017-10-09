function People(name, id, roomID) {
  this.name = name;
  this.id = id;
  this.roomID = roomID;
  this.status = 'available';
  this.ready = false;
};

People.prototype.Joined = function(room){
        this.roomID = room;
        this.status = 'ingame';
};

People.prototype.SS = function(){
        this.ready = true;
};

People.prototype.Leave = function(){
        this.status = 'available';
        this.roomID = null;
        this.ready = false;
};


module.exports = People;