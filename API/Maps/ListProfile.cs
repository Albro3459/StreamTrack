using AutoMapper;

using API.Models;
using API.DTOs;

public class ListProfile : Profile {
    public ListProfile() {
        CreateMap<List, ListDTO>();

        CreateMap<ListDTO, ListMinimalDTO>()
            .ForMember(
                dest => dest.ContentIDs,
                opt => opt.MapFrom(src => src.Contents.Select(c => c.ContentID).ToList())
            );

    }
}